/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  customerOrderTable,
  customerTable,
  addressTable,
  orderItemTable,
  orderPaymentTable,
} from './index'

import type {
  SelectCustomerOrder,
  InsertCustomerOrder,
  InsertAddress,
  InsertOrderItem,
  InsertCustomer,
  SelectAddress,
  SelectOrderItem,
  SelectCustomer,
  InsertOrderPayment,
} from './index'
import { db } from '$db'
import { eq, ne, or, sql } from 'drizzle-orm'

import { stock, bugReport } from '$db/controller'
import { cashierTransactionTable } from '../distribuidora'
import { TRPCError } from '@trpc/server'

export const customer = {
  tables: {
    customerTable,
    addressTable,
    customerOrderTable,
    orderItemTable,
  },
  insertCustomer: (input: InsertCustomer) => {
    return db.insert(customerTable).values(input)
  },
  updateCustomer: (
    id: SelectCustomer['id'],
    input: Partial<InsertCustomer>,
  ) => {
    return db.update(customerTable).set(input).where(eq(customerTable.id, id))
  },
  deleteCustomerById: (id: SelectCustomer['id']) => {
    return db.delete(customerTable).where(eq(customerTable.id, id))
  },
  getCustomerById: async (id: SelectCustomer['id']) => {
    return db.query.customerTable.findFirst({
      where: eq(customerTable.id, id),
      with: {
        adresses: true,
      },
    })
  },

  getCustomerByEmail: async (email: string) => {
    return db.query.customerTable.findFirst({
      where: eq(customerTable.email, email),
      with: {
        adresses: true,
      },
    })
  },
  getCustomersWithAddress: async () => {
    return db.query.customerTable.findMany({
      with: {
        adresses: true,
      },
    })
  },
  getCustomers: () => {
    return db.select().from(customerTable)
  },
  insertAddress: async (input: InsertAddress) => {
    return db.insert(addressTable).values(input)
  },
  getCustomerAddress: async (customerId: SelectCustomer['id']) => {
    return db
      .select()
      .from(addressTable)
      .where(eq(addressTable.customer_id, customerId))
  },
  insertOrder: async (input: {
    order_info: Omit<
      InsertCustomerOrder,
      'status' | 'payment_method' | 'payment_status'
    >
    order_items: Omit<InsertOrderItem, 'order_id'>[]
    payment_info: {
      payment_status: InsertCustomerOrder['payment_status']
      amount_paid?: number
    }
  }) => {
    const { order_info, order_items, payment_info } = input

    const resp = await db.transaction(async tx => {
      // switch (payment_info.payment_method) {
      //   case 'fiado': {
      //     if (!order_info.customer_id) {
      //       await tx.rollback()
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message: 'Para pagar fiado é necessario selecionar um cliente',
      //       })
      //     }
      //     const [customer] = await tx
      //       .select()
      //       .from(customerTable)
      //       .where(eq(customerTable.id, order_info.customer_id))
      //     if (customer.max_credit < order_info.total + customer.used_credit) {
      //       await tx.rollback()
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message: `Customer ${customer.name} has no credit available`,
      //       })
      //     }
      //     await tx
      //       .update(customerTable)
      //       .set({
      //         // used_credit: sql`${customerTable.used_credit} + ${order_info.total}`,
      //         used_credit: customer.used_credit + order_info.total,
      //       })
      //       .where(eq(customerTable.id, order_info.customer_id))
      //     break
      //   }

      //   case 'dinheiro': {
      //     if (!payment_info.amount_paid) {
      //       await tx.rollback()
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message:
      //           'Para pagar em dinheiro é necessario informar o valor pago',
      //       })
      //     }

      //     if (payment_info.amount_paid < order_info.total) {
      //       await tx.rollback()
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message: 'O valor pago é menor que o valor da compra',
      //       })
      //     }
      //     if (!order_info.cachier_id) {
      //       await tx.rollback()
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message: 'Para pagar em dinheiro é necessario informar o caixa',
      //       })
      //     }

      //     await tx.insert(cashierTransactionTable).values({
      //       cashier_id: order_info.cachier_id,
      //       amount: payment_info.amount_paid,
      //       type: 'Entrada',
      //       observation: 'Venda',
      //       meta_data: {
      //         order_id: order_info.id,
      //       },
      //     })

      //     await tx.insert(cashierTransactionTable).values({
      //       cashier_id: order_info.cachier_id,
      //       amount: payment_info.amount_paid - order_info.total,
      //       type: 'Troco',
      //       observation: 'Venda',
      //       meta_data: {
      //         order_id: order_info.id,
      //       },
      //     })

      //     break
      //   }

      //   default:
      //     break
      // }

      const [order] = await tx
        .insert(customerOrderTable)
        .values({
          payment_status: payment_info.payment_status,
          status: 'PENDING',
          total: order_info.total,
          customer_id: order_info.customer_id,
          address_id: order_info.address_id,
        })
        .returning()

      const items = order_items.map(item => ({
        ...item,
        order_id: order.id,
      }))
      await tx.insert(orderItemTable).values(items)
      return {
        order,
        items,
      }
    })
    return resp
  },

  getOrderByID: async (order_id: SelectCustomerOrder['id']) => {
    return db.query.customerOrderTable.findFirst({
      where: eq(customerOrderTable.id, order_id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        address: true,
        customer: true,
        payments: true,
        transactions: true,
      },
    })
  },

  updateOrderStatus: async (
    order_id: SelectCustomerOrder['id'],
    new_status: SelectCustomerOrder['status'],
  ) => {
    console.log('Updating order status:', order_id, new_status)
    if (new_status === 'DELIVERED') {
      const order = await customer.getOrderByID(order_id)
      console.log('Order:', order)

      if (!order) {
        return {
          error: 'Order not found',
        }
      }

      for (const item of order.items) {
        console.log('sku', item.product.sku)
        if (item.product.sku) {
          try {
            console.log('Processing stock transaction:', {
              sku_id: item.product.sku,
              quantity: -item.quantity * item.product.quantity,
              meta_data: {
                order_id,
                type: 'saida',
              },
            })
            await stock.insertStockTransaction({
              sku: item.product.sku,
              type: 'Saida',
              quantity: -item.quantity * item.product.quantity,
              meta_data: {
                order_id,
                type: 'saida',
              },
            })
          } catch (error) {
            console.error('Failed to process stock transaction:', error)
          }
        }
      }
    }

    return await db
      .update(customerOrderTable)
      .set({ status: new_status })
      .where(eq(customerOrderTable.id, order_id))
  },

  updateOrderPaymentStatus: async (
    order_id: SelectCustomerOrder['id'],
    new_status: SelectCustomerOrder['payment_status'],
  ) => {
    console.log('Updating order payment status:', order_id, new_status)

    return await db
      .update(customerOrderTable)
      .set({ payment_status: new_status })
      .where(eq(customerOrderTable.id, order_id))
  },

  getCustomerOrders: async (customerId: SelectCustomer['id']) => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.customer_id, customerId),
      with: {
        address: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },

  getCurrentOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: or(
        ne(customerOrderTable.status, 'DELIVERED'),
        ne(customerOrderTable.status, 'CANCELED'),
        ne(customerOrderTable.status, 'ENDED'),
      ),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  getEndedOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.status, 'ENDED'),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  getPendingOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.payment_status, 'PENDING'),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  insertOrderPayment: (data: InsertOrderPayment) => {
    return db.insert(orderPaymentTable).values(data)
  },
}

export type CurrentOrders = Awaited<
  ReturnType<typeof customer.getCurrentOrders>
>
