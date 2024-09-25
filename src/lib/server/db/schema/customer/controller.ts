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
import { and, count, eq, gte, ne, or, sql } from 'drizzle-orm'

import { stock, bugReport } from '$db/controller'
import { cashierTable, cashierTransactionTable } from '../distribuidora'
import { TRPCError } from '@trpc/server'
import { userTable } from '../user'

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

  getCustomerUsedCredit: async (id: SelectCustomer['id']) => {
    return db
      .select({
        used_credit: sql`SUM(${customerOrderTable.total} - ${customerOrderTable.amount_paid})`,
      })
      .from(customerOrderTable)
      .where(
        and(
          eq(customerOrderTable.customer_id, id),
          gte(customerOrderTable.total, customerOrderTable.amount_paid),
        ),
      )
  },
  countFiadoTransactions: async (id: SelectCustomer['id']) => {
    return db
      .select({
        count: count(customerOrderTable.id),
      })
      .from(customerOrderTable)
      .where(
        and(
          eq(customerOrderTable.customer_id, id),
          gte(customerOrderTable.total, customerOrderTable.amount_paid),
        ),
      )
  },
  getPendingFiadoTransactions: async () => {
    return db.query.customerOrderTable.findMany({
      where: t => gte(t.total, t.amount_paid),
      with: {
        customer: true,
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
      where: eq(customerOrderTable.status, 'DELIVERED'),
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
  insertOrderPayment: async (data: InsertOrderPayment) => {
    await db.update(customerOrderTable).set({
      amount_paid: sql`${customerOrderTable.amount_paid} + ${data.amount_paid}`,
    })
    return await db.insert(orderPaymentTable).values(data)
  },
  getOrderPayments: (id: number) => {
    return db
      .select()
      .from(orderPaymentTable)
      .where(eq(orderPaymentTable.id, id))
  },
  getNotPaidOrders: () => {
    return db.query.orderPaymentTable.findMany({
      where: t => eq(t.status, 'PENDING'),
      with: {
        order: {
          with: {
            customer: true,
            items: true,
          },
        },
      },
    })
  },
  getNotPaidOrdersById: (id: number) => {
    return db.query.orderPaymentTable.findMany({
      where: t => and(eq(t.status, 'PENDING'), eq(t.order_id, id)),
      with: {
        order: {
          with: {
            customer: true,
            items: true,
          },
        },
      },
    })
  },
  updateOrderPayment: async (id: number, data: Partial<InsertOrderPayment>) => {
    return db
      .update(orderPaymentTable)
      .set(data)
      .where(eq(orderPaymentTable.id, id))
  },

  getAllOrderInfo: () => {
    return db
      .select({
        //Order:
        id: customerOrderTable.id,
        created_at: customerOrderTable.created_at,
        updated_at: customerOrderTable.updated_at,
        is_fiado: customerOrderTable.is_fiado,
        observation: customerOrderTable.observation,
        amount_paid: customerOrderTable.amount_paid,
        total: customerOrderTable.total,
        status: customerOrderTable.status,
        type: customerOrderTable.type,
        
        //customer:
        name: customerTable.name,
        email: customerTable.email,
        cellphone: customerTable.cellphone,

        //cashier
        cashier: cashierTable.name,


      })
      .from(customerOrderTable)
      .leftJoin(
        customerTable,
        eq(customerTable.id, customerOrderTable.customer_id),
      )
      .leftJoin(
        cashierTable,
        eq(cashierTable.id, customerOrderTable.cachier_id),
      )
  },
}

export type CurrentOrders = Awaited<
  ReturnType<typeof customer.getCurrentOrders>
>
