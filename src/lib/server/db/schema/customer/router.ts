/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import {
  bugReport,
  customer as customerController,
  distribuidora,
} from '$db/controller'
import {
  insertCustomerSchema,
  insertAddressSchema,
  customerTable,
  paymentMethodEnum,
  paymentStatusEnum,
  insertOrderPaymentSchema,
  cashierTransactionTable,
  orderPaymentTable,
  customerOrderTable,
  type InsertOrderPayment,
  orderItemTable,
  orderTypeEnum,
  type InsertCashierTransaction,
} from '$lib/server/db/schema'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '$trpc/middleware'
import { db } from '../..'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { geocodeAddress, getDistanceFromLatLonInKm } from '$lib/utils/distance'
import { env } from '$env/dynamic/private'

export const customer = router({
  insertCustomer: publicProcedure
    .meta({
      routeName: 'Adicionar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)

    .input(insertCustomerSchema)
    .mutation(async ({ input }) => {
      return await customerController.insertCustomer(input).returning()
    }),
  updateCustomer: publicProcedure
    .meta({
      routeName: 'Atualizar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        id: z.number(),
        customer: z.object({
          name: z.string().optional(),
          cellphone: z.string().optional(),
          phone: z.string().optional(),
          max_credit: z.number().optional(),
          used_credit: z.number().optional(),
          email: z.string().email().optional(),
          is_retail: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, customer } = input
      return await customerController.updateCustomer(id, customer)
    }),

  deleteCustomer: publicProcedure
    .meta({
      routeName: 'Deletar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(z.number())
    .mutation(async ({ input }) => {
      return await customerController.deleteCustomerById(input)
    }),

  insertAddress: publicProcedure
    .meta({
      routeName: 'Adicionar Endereço',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertAddressSchema)
    .mutation(async ({ input }) => {
      try {
        return await customerController.insertAddress(input)
      } catch (error) {
        console.error('Failed to insert address:', error)
      }
    }),
  getPaginatedCustomers: publicProcedure
    .input(paramsSchema)
    .query(async ({ input }) => {
      return await tableHelper(
        customerController.getCustomers().$dynamic(),
        customerTable,
        'name',
        input,
      )
    }),

  getPaginatedOrders: publicProcedure
    .input(paramsSchema)
    .query(async ({ input }) => {
      return await tableHelper(
        customerController.getAllOrderInfo().$dynamic(),
        customerOrderTable,
        'name',
        input,
      )
    }),

  getCustomers: publicProcedure.query(async () => {
    return await customerController.getCustomersWithAddress()
  }),
  order: router({
    insertFiado: publicProcedure
      .meta({
        routeName: 'Adicionar Pedido Fiado',
        permission: 'receber_fiado',
      })
      .use(middleware.auth)
      .use(middleware.checkPermission)
      .use(middleware.logged)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number(),
            address_id: z.number().optional(),
            total: z.number(),
            observation: z.string(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),
            cachier_id: z.number().optional(),
            taxa_entrega: z.number().optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        const { order_items, order_info } = input
        const customer = await customerController.getCustomerById(
          order_info.customer_id,
        )
        if (!customer) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cliente não encontrado',
          })
        }

        const used_credit = await customerController.getCustomerUsedCredit(
          order_info.customer_id,
        )

        let credit = 0

        if (typeof used_credit !== 'number') {
          const [{ count }] = await customerController.countFiadoTransactions(
            order_info.customer_id,
          )
          // if (count !== 0) {
          //   throw new TRPCError({
          //     code: 'BAD_REQUEST',
          //     message: 'Cliente não possui crédito',
          //   })
          // }
          //TODO:TA DANDO ERRO QUANDO FAZ PEDIDO FIADO
        } else {
          credit = used_credit
        }

        if (customer?.max_credit < credit + order_info.total) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cliente não possui crédito suficiente para esta compra',
          })
        }

        const [order] = await db
          .insert(customerOrderTable)
          .values({
            status: order_info.motoboy_id ? 'CONFIRMED' : 'DELIVERED',
            is_fiado: true,
            type: order_info.type,
            total: order_info.motoboy_id
              ? order_info.total + (order_info.taxa_entrega ?? 0)
              : order_info.total,
            amount_paid: 0,
            motoboy_id: order_info.motoboy_id,
            customer_id: order_info.customer_id,
            address_id: order_info.address_id,
            cachier_id: order_info.cachier_id,
            observation: order_info.observation,
            taxa_entrega: order_info.taxa_entrega,
          })
          .returning()

        const items = order_items.map(item => ({
          ...item,
          order_id: order.id,
        }))

        const order_items_db = await db
          .insert(orderItemTable)
          .values(items)
          .returning()

        // const fiado_transaction = await db
        //   .insert(fiadoTransactionTable)
        //   .values({
        //     order_id: order.id,
        //     amount: order_info.total,
        //     customer_id: order_info.customer_id,
        //   })
        //   .returning()

        return {
          order,
          order_items: order_items_db,
          // fiado_transaction,
        }
      }),
    insetPaidOrder: publicProcedure
      .use(middleware.logged)
      .use(middleware.auth)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number().optional(),
            address_id: z.number().optional(),
            total: z.number(),
            observation: z.string(),
            cashier_id: z.number(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),
            taxa_entrega: z.number().optional(),

            payment_info: insertOrderPaymentSchema
              .omit({ order_id: true })
              .array(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.locals.user?.id
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuário não autorizado',
          })
        }

        const { order_items, order_info } = input

        const total_paid: number = order_info.payment_info.reduce(
          (acc, payment) => acc + payment.amount_paid,
          0,
        )

        if (total_paid < order_info.total) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Valor pago é menor que o total da compra, adicione mais pagamentos',
          })
        }

        const [order] = await db
          .insert(customerOrderTable)
          .values({
            amount_paid: total_paid,
            is_fiado: false,
            type: order_info.type,
            motoboy_id: order_info.motoboy_id,
            status: order_info.motoboy_id ? 'CONFIRMED' : 'DELIVERED',
            total: order_info.motoboy_id
              ? order_info.total + (order_info.taxa_entrega ?? 0)
              : order_info.total,
            customer_id: order_info.customer_id,
            address_id: order_info.address_id,
            cachier_id: order_info.cashier_id,
            observation: order_info.observation,
            created_by: userId,
            taxa_entrega: order_info.taxa_entrega,
          })
          .returning()

        const items = order_items.map(item => ({
          ...item,
          order_id: order.id,
        }))
        const order_items_db = await db
          .insert(orderItemTable)
          .values(items)
          .returning()

        const trocos: InsertCashierTransaction[] = []
        const transactions: InsertCashierTransaction[] = []
        for (const payment of order_info.payment_info) {
          transactions.push({
            created_by: userId,
            cachier_id: order_info.cashier_id,
            type: 'PAGAMENTO',
            order_id: order.id,

            meta_data: {
              customer: order_info.customer_id,
            },
            amount: payment.amount_paid,
          })
          if (payment.troco) {
            trocos.push({
              created_by: userId,
              cachier_id: order_info.cashier_id,
              type: 'Troco',
              order_id: order.id,
              meta_data: {
                customer: order_info.customer_id,
              },
              amount: payment.troco,
            })
          }

          await bugReport.insertLogs({
            text: `Pagamento de ${payment.amount_paid} para pedido ${order.id}${payment.troco ? ` com troco de ${payment.troco}` : ''}`,
            created_by: userId,
            metadata: {
              order_id: order.id,
              payment_id: payment.id,
              customer_id: order_info.customer_id,
              amount_paid: payment.amount_paid,
              troco: payment.troco,
            },
            type: 'CAIXA',
            pathname: '/TODO:ROUTE',
            routeName: 'Pagamento',
            currency: payment.amount_paid,
          })
        }
        if (trocos.length > 0) {
          await distribuidora.insertCashierTransaction(trocos, true)
        }
        await distribuidora.insertCashierTransaction(transactions)
        const payments = order_info.payment_info.map(payment => ({
          ...payment,
          cachier_id: order_info.cashier_id,
          created_by: userId,
          order_id: order.id,
        }))

        const payments_db = await db
          .insert(orderPaymentTable)
          .values(payments)
          .returning()

        return {
          order,
          order_items: order_items_db,
          payments: payments_db,
        }
      }),
      insertOrderWaiting: publicProcedure
      .use(middleware.auth)
      .use(middleware.logged)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number(),
            address_id: z.number(),
            total: z.number(),
            observation: z.string(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string(),
            cachier_id: z.number().optional(),
            taxa_entrega: z.number().optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        const { order_items, order_info } = input
        const customer = await customerController.getCustomerById(
          order_info.customer_id,
        )
        if (!customer) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cliente não encontrado',
          })
        }

        if(!order_info.motoboy_id){
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sem motoboy selecionado',
          })
        }
        const [order] = await db
          .insert(customerOrderTable)
          .values({
            status: 'CONFIRMED',
            is_fiado: false,
            type: order_info.type,
            total: order_info.motoboy_id
              ? order_info.total + (order_info.taxa_entrega ?? 0)
              : order_info.total,
            amount_paid: 0,
            motoboy_id: order_info.motoboy_id,
            customer_id: order_info.customer_id,
            address_id: order_info.address_id,
            cachier_id: order_info.cachier_id,
            observation: order_info.observation,
            taxa_entrega: order_info.taxa_entrega,
          })
          .returning()

        const items = order_items.map(item => ({
          ...item,
          order_id: order.id,
        }))

        const order_items_db = await db
          .insert(orderItemTable)
          .values(items)
          .returning()

        return {
          order,
          order_items: order_items_db,
          // fiado_transaction,
        }
      }),
    payments: router({
      getPendingFiadoTransactions: publicProcedure
        .use(middleware.logged)
        .use(middleware.auth)
        .query(async () => {
          return await customerController.getPendingFiadoTransactions()
        }),
      getPayments: publicProcedure
        .use(middleware.logged)
        .use(middleware.auth)
        .input(z.number())
        .query(async ({ input }) => {
          return await customerController.getOrderPayments(input)
        }),
      insertPayment: publicProcedure
        .meta({
          routeName: 'Receber Pagamento',
          permission: 'receber_fiado',
        })
        .use(middleware.logged)
        .use(middleware.auth)
        .input(
          z.object({
            payment_info: insertOrderPaymentSchema.omit({ created_by: true }),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const { payment_info } = input
          const userId = ctx.locals.user?.id
          const newPayment = {
            ...payment_info,
            created_by: userId,
          }

          await bugReport.insertLogs({
            text: `Pagamento de ${payment_info.amount_paid} para pedido ${payment_info.order_id}`,
            created_by: userId,
            metadata: {
              order_id: payment_info.order_id,
              payment_id: payment_info.id,
              amount: payment_info.amount_paid,
            },
            type: 'CAIXA',
            pathname: '/TODO:ROUTE',
            routeName: 'Pagamento',
            currency: payment_info.amount_paid,
          })
          return await customerController.insertOrderPayment(payment_info)
        }),
    }),
  }),

  updateOrderStatus: publicProcedure
    .meta({
      routeName: 'Atualizar Status do Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        order_id: z.number(),
        status: z.enum([
          'PENDING',
          'CONFIRMED',
          'PREPARING',
          'ON THE WAY',
          'DELIVERED',
          'CANCELED',
          'ENDED',
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { order_id, status } = input
      const user = ctx.locals.user
      await bugReport.insertLogs({
        text: `${user?.username} atualizou o status do pedido ${order_id} para ${status}`,
        created_by: user?.id,
        metadata: {
          order_id,
          status,
        },
        type: 'SYSTEM',
        pathname: '/TODO:ROUTE',
        routeName: 'Atualizar Pedido',
      })
      return await customerController.updateOrderStatus(order_id, status)
    }),

  // updateOrderPaymentStatus: publicProcedure
  //   .use(middleware.logged)
  //   .use(middleware.auth)
  //   .input(
  //     z.object({
  //       order_id: z.number(),
  //       payment_status: z.enum([
  //         'PENDING',
  //         'CONFIRMED',
  //         'CANCELED',
  //         'REFUNDED',
  //       ]),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const { order_id, payment_status } = input
  //     return await customerController.updateOrderPaymentStatus(
  //       order_id,
  //       payment_status,
  //     )
  //   }),

  insertOrderPayment: publicProcedure
    .meta({
      routeName: 'Adicionar Pagamento',
      permission: 'receber_fiado',
    })
    .use(middleware.logged)
    .input(
      insertOrderPaymentSchema.omit({
        created_by: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userID = ctx.locals.user?.id
      return await customerController.insertOrderPayment({
        ...input,
        created_by: userID,
      })
    }),

  getOrderPayments: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await customerController.getOrderPayments(input)
    }),

  getAllNotPaidOrders: publicProcedure.query(async () => {
    return await customerController.getNotPaidOrders()
  }),

  getCustomerUsedCredits: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const id = input
      return await customerController.getCustomerUsedCredit(id)
    }),

  getNotPaidOrdersById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const id = input
      return await customerController.getNotPaidOrdersById(id)
    }),

  updateOrderPayment: publicProcedure
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        id: z.number(),
        data: insertOrderPaymentSchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      const { id, data } = input
      return customerController.updateOrderPayment(id, data)
    }),

  getCurrentOrders: publicProcedure.use(middleware.logged).query(() => {
    return customerController.getCurrentOrders()
  }),

  calculateDistance: publicProcedure
    .input(
      z.object({
        cep: z.string(),
        state: z.string(),
        city: z.string(),
        bairro: z.string(),
        street: z.string(),
        number: z.string(),
        country: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const location = await geocodeAddress(
        input.street +
          input.number +
          input.city +
          input.bairro +
          input.state +
          input.cep +
          input.country,
      )

      if (!location) {
        throw new Error(
          'Endereço não encontrado para calcular taxa de entrega!',
        )
      }
      console.log(location)

      const customerPosition = {
        lat: location.lat,
        lon: location.lng,
      }

      const distribuidoraLat = parseFloat(env.DISTRIBUIDORA_LAT || '0')
      const distribuidoraLong = parseFloat(env.DISTRIBUIDORA_LONG || '0')

      const distance = getDistanceFromLatLonInKm(
        { lat: distribuidoraLat, lon: distribuidoraLong },
        customerPosition,
      )

      return distance
    }),
})
