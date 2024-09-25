/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { customer as customerController, distribuidora } from '$db/controller'
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
} from '$lib/server/db/schema'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '$trpc/middleware'
import { db } from '../..'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const customer = router({
  insertCustomer: publicProcedure
    .use(middleware.auth)
    .use(middleware.logged)

    .input(insertCustomerSchema)
    .mutation(async ({ input }) => {
      return await customerController.insertCustomer(input).returning()
    }),
  updateCustomer: publicProcedure
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
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input }) => {
      return await customerController.deleteCustomerById(input)
    }),

  insertAddress: publicProcedure
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

  // insertCashierOrder: publicProcedure
  //   .use(middleware.auth)
  //   .use(middleware.logged)
  //   .input(
  //     z.object({
  //       order_items: z.array(
  //         z.object({
  //           product_id: z.number(),
  //           quantity: z.number(),
  //           price: z.number(),
  //         }),
  //       ),
  //       order_info: z.object({
  //         customer_id: z.number().optional(),
  //         address_id: z.number().optional(),
  //         total: z.number(),
  //         observation: z.string(),
  //         cachier_id: z.number().optional(),
  //       }),
  //       payment_info: insertOrderPaymentSchema.omit({ order_id: true }).array(),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const { order_items, order_info, payment_info } = input

  //     const total_paid = payment_info.reduce(
  //       (acc, payment) => acc + payment.amount_paid,
  //       0,
  //     )

  //     if (total_paid < order_info.total) {
  //       throw new TRPCError({
  //         code: 'BAD_REQUEST',
  //         message:
  //           'Valor pago é menor que o total da compra, adicione mais pagamentos',
  //       })
  //     }

  //     return await db.transaction(async tx => {
  //       const [order] = await tx
  //         .insert(customerOrderTable)
  //         .values({
  //           status: 'PENDING',
  //           total: order_info.total,
  //           customer_id: order_info.customer_id,
  //           address_id: order_info.address_id,
  //         })
  //         .returning()

  //       const items = order_items.map(item => ({
  //         ...item,
  //         order_id: order.id,
  //       }))

  //       const [customer] = order_info.customer_id
  //         ? await tx
  //             .select()
  //             .from(customerTable)
  //             .where(eq(customerTable.id, order_info.customer_id))
  //         : [null]

  //       const total_fiado = payment_info
  //         .filter(payment => payment.payment_method === 'fiado')
  //         .reduce((acc, payment) => acc + payment.amount_paid, 0)

  //       if (
  //         customer &&
  //         customer.max_credit < total_fiado + customer.used_credit
  //       ) {
  //         throw new TRPCError({
  //           code: 'BAD_REQUEST',
  //           message: 'Cliente não possui crédito suficiente para esta compra',
  //         })
  //       }

  //       for (const payment of payment_info || []) {
  //         switch (payment.payment_method) {
  //           case 'dinheiro': {
  //             if (order_info.cachier_id && payment.troco) {
  //               await tx.insert(cashierTransactionTable).values({
  //                 cashier_id: order_info.cachier_id,
  //                 amount: payment.amount_paid,
  //                 observation: `Venda ${order.id}`,
  //                 type: 'Entrada',
  //                 meta_data: {
  //                   order_id: order.id,
  //                   payment_method: payment.payment_method,
  //                 },
  //               })
  //               await tx.insert(cashierTransactionTable).values({
  //                 cashier_id: order_info.cachier_id,
  //                 amount: payment.troco,
  //                 observation: `Venda ${order.id}`,
  //                 type: 'Troco',
  //                 meta_data: {
  //                   order_id: order.id,
  //                   payment_method: payment.payment_method,
  //                 },
  //               })
  //             }

  //             break
  //           }
  //           case 'fiado': {
  //             break
  //           }
  //           // case 'credit_card': {
  //           //   break
  //           // }
  //           // case 'debit_card': {
  //           //   break
  //           // }
  //           // case 'pix': {
  //           //   break
  //           // }

  //           default: {
  //             if (order_info.cachier_id) {
  //               await tx.insert(cashierTransactionTable).values({
  //                 cashier_id: order_info.cachier_id,
  //                 amount: payment.amount_paid,
  //                 observation: `Venda ${order.id}`,
  //                 type: 'PAGAMENTO',
  //                 meta_data: {
  //                   order_id: order.id,
  //                   payment_method: payment.payment_method,
  //                 },
  //               })
  //             }
  //             // await tx.insert(orderPaymentTable).values({
  //             //   ...payment,
  //             //   order_id: order.id,
  //             // })
  //             break
  //           }
  //         }

  //         await tx
  //           .insert(orderPaymentTable)
  //           .values({ ...payment, order_id: order.id })
  //       }

  //       await tx.insert(orderItemTable).values(items)
  //       return {
  //         order,
  //         items,
  //       }
  //     })
  //   }),

  order: router({
    insertFiado: publicProcedure
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
            customer_id: z.number(),
            address_id: z.number().optional(),
            total: z.number(),
            observation: z.string(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),
            cachier_id: z.number().optional(),
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

        const [{ used_credit }] =
          await customerController.getCustomerUsedCredit(order_info.customer_id)

        let credit = 0

        if (typeof used_credit !== 'number') {
          const [{ count }] = await customerController.countFiadoTransactions(
            order_info.customer_id,
          )
          if (count !== 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cliente não possui crédito',
            })
          }
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
            status: 'PENDING',
            is_fiado: true,
            type: order_info.type,
            total: order_info.total,
            amount_paid: 0,
            motoboy_id: order_info.motoboy_id,
            customer_id: order_info.customer_id,
            address_id: order_info.address_id,
            cachier_id: order_info.cachier_id,
            observation: order_info.observation,
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
            cashier_id: z.number().optional(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),

            payment_info: insertOrderPaymentSchema.omit({order_id: true}).array(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
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
            status: 'PENDING',
            total: order_info.total,
            customer_id: order_info.customer_id,
            address_id: order_info.address_id,
            cachier_id: order_info.cashier_id,
            observation: order_info.observation,
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

        const payments = order_info.payment_info.map(payment => {
          switch (payment.payment_method) {
            case 'dinheiro':
              if (order_info.cashier_id) {
                distribuidora
                  .insertCashierTransaction({
                    cashier_id: order_info.cashier_id,
                    type: 'PAGAMENTO',
                    order_id: order.id,
                    meta_data: {
                      customer: order_info.customer_id,
                    },
                    amount: payment.amount_paid,
                  })
                  .then()
                if (payment.troco && payment.troco > 0) {
                  distribuidora
                    .insertCashierTransaction({
                      cashier_id: order_info.cashier_id,
                      type: 'Troco',
                      order_id: order.id,
                      meta_data: {
                        customer: order_info.customer_id,
                      },
                      amount: payment.amount_paid,
                    })
                    .then()
                }
              }
              break

            default:
              break
          }
          return { ...payment, order_id: order.id }
        })

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
        .use(middleware.logged)
        .use(middleware.auth)
        .input(
          z.object({
            payment_info: insertOrderPaymentSchema,
          }),
        )
        .mutation(async ({ input }) => {
          const { payment_info } = input
          return await customerController.insertOrderPayment(payment_info)
        }),
    }),
  }),

  updateOrderStatus: publicProcedure
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
    .mutation(async ({ input }) => {
      const { order_id, status } = input
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
    .use(middleware.logged)
    .input(insertOrderPaymentSchema)
    .mutation(async ({ input }) => {
      return await customerController.insertOrderPayment(input)
    }),

  getOrderPayments: publicProcedure
    .use(middleware.logged)
    .input(z.number())
    .query(async ({ input }) => {
      return await customerController.getOrderPayments(input)
    }),

  getAllNotPaidOrders: publicProcedure.query(async () => {
    return await customerController.getNotPaidOrders()
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
})
