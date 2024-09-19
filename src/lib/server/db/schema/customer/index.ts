/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sqliteTable,
  text,
  integer,
  index,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { sql, relations, gt, gte } from 'drizzle-orm'

import {
  userTable,
  productItemTable,
  stockTransactionTable,
  cashierTable,
} from '$db/schema'
import { createInsertSchema } from 'drizzle-zod'

import { product } from '$db/controller'

export const customerTable = sqliteTable('cliente', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // .$defaultFn(() => generateId(15)),
  is_retail: integer('is_retail', { mode: 'boolean' }).notNull(),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  name: text('name').notNull(),
  email: text('email').unique(),
  birth_date: text('birth_date'),
  cellphone: text('cellphone'),
  phone: text('phone'),
  cpf_cnpj: text('cpf_cnpj'),
  rg_ie: text('rg_ie'),
  max_credit: integer('max_credit').notNull().default(50000),
})
export const customerRelations = relations(customerTable, ({ one, many }) => ({
  adresses: many(addressTable),
  orders: many(customerOrderTable),
  user: one(userTable, {
    fields: [customerTable.email],
    references: [userTable.email],
  }),
  fiado_transactions: many(fiadoTransactionTable)
}))
export const insertCustomerSchema = createInsertSchema(customerTable, {})
export const updateCustomerSchema = insertCustomerSchema.pick({
  birth_date: true,
  cellphone: true,
  cpf_cnpj: true,
  rg_ie: true,
  email: true,
  name: true,
  phone: true,
  is_retail: true,
  max_credit: true,
})
export type SelectCustomer = typeof customerTable.$inferSelect
export type InsertCustomer = typeof customerTable.$inferInsert

export const fiadoTransactionTable = sqliteTable('fiado_transaction',{
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id:integer('customer_id').notNull().references(()=>customerTable.id),
  order_id:integer('order_id').notNull().references(()=>customerOrderTable.id),
  amount:integer('amount').notNull(),
  amount_paid:integer('amount_paid').default(0).notNull(),
  obsertation:text('observation')
}, (t)=>({
  paid: index('paid_index').on(t.amount_paid).where(gte(t.amount_paid,t.amount)),
}))

export const fiadoTransactionRelations = relations(
  fiadoTransactionTable, ({one,many})=> ({
    customer: one(customerTable,{
      fields:[fiadoTransactionTable.customer_id],
      references:[customerTable.id]
    }),
    order:one(customerOrderTable,{
      fields:[fiadoTransactionTable.order_id],
      references:[customerOrderTable.id]
    }),
  })
)

export type InsertFiadoTransaction = typeof fiadoTransactionTable.$inferInsert
export type SelectFiadoTransaction = typeof fiadoTransactionTable.$inferSelect

export const addressTable = sqliteTable('endereco', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  // .$defaultFn(() => generateId(15)),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  customer_id: integer('customer_id')
    .notNull()
    .references(() => customerTable.id),
  cep: text('cep').notNull(),
  street: text('street').notNull(),
  number: text('number').notNull(),
  complement: text('complement').notNull(),
  neighborhood: text('neighborhood').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
})

export const addressRelations = relations(addressTable, ({ one, many }) => ({
  customer: one(customerTable, {
    fields: [addressTable.customer_id],
    references: [customerTable.id],
  }),
  orders: many(customerOrderTable),
}))
export const insertAddressSchema = createInsertSchema(addressTable)
export type SelectAddress = typeof addressTable.$inferSelect
export type InsertAddress = typeof addressTable.$inferInsert

export const paymentMethodEnum = [
  'credit_card',
  'debit_card',
  'pix',
  'dinheiro',
] as const

export const paymentStatusEnum = [
  'PENDING',
  'CONFIRMED',
  'CANCELED',
  'REFUNDED',
] as const

export const orderStatusEnum = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'ON THE WAY',
  'DELIVERED',
  'CANCELED',
  'ENDED',
] as const

export const customerOrderTable = sqliteTable('pedidos', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  // .$defaultFn(() => generateId(15)),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  customer_id: integer('customer_id').references(() => customerTable.id),
  address_id: integer('address_id').references(() => addressTable.id),
  cachier_id: integer('cachier_id').references(() => cashierTable.id),
  observation: text('observation'),
  total: integer('total').notNull(),
  status: text('status', {
    enum: orderStatusEnum,
  }).notNull(),
})

export const customerOrderRelations = relations(
  customerOrderTable,
  ({ one, many }) => ({
    customer: one(customerTable, {
      fields: [customerOrderTable.customer_id],
      references: [customerTable.id],
    }),
    address: one(addressTable, {
      fields: [customerOrderTable.address_id],
      references: [addressTable.id],
    }),
    items: many(orderItemTable),
    transactions: many(stockTransactionTable),

    payments: many(orderPaymentTable),
    fiado_transactions:many(fiadoTransactionTable)
  }),
)
export type SelectCustomerOrder = typeof customerOrderTable.$inferSelect
export type InsertCustomerOrder = typeof customerOrderTable.$inferInsert

export const orderItemTable = sqliteTable('item_pedido', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  order_id: integer('order_id')
    .notNull()
    .references(() => customerOrderTable.id),
  product_id: integer('product_id')
    .notNull()
    .references(() => productItemTable.id),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
})

export const orderItemRelations = relations(
  orderItemTable,
  ({ one, many }) => ({
    order: one(customerOrderTable, {
      fields: [orderItemTable.order_id],
      references: [customerOrderTable.id],
    }),
    product: one(productItemTable, {
      fields: [orderItemTable.product_id],
      references: [productItemTable.id],
    }),
  }),
)

export type SelectOrderItem = typeof orderItemTable.$inferSelect
export type InsertOrderItem = typeof orderItemTable.$inferInsert

export const orderPaymentTable = sqliteTable('pagamentos', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  amount_paid: integer('amount_paid').notNull(),
  troco: integer('troco'),
  payment_method: text('payment_method', { enum: paymentMethodEnum }).notNull(),
  order_id: integer('order_id')
    .references(() => customerOrderTable.id)
    .notNull(),
  status: text('status', { enum: paymentStatusEnum }).notNull(),
  observation:text('observation'),
  fiado_id:integer('id').references(()=>fiadoTransactionTable.id),
  cachier_id: integer('cachier_id').references(() => cashierTable.id),
})

export const orderPaymentRelations = relations(
  orderPaymentTable,
  ({ one }) => ({
    order: one(customerOrderTable, {
      references: [customerOrderTable.id],
      fields: [orderPaymentTable.order_id],
    }),
  }),
)

export type SelectOrderPayment = typeof orderPaymentTable.$inferSelect
export type InsertOrderPayment = typeof orderPaymentTable.$inferInsert
export const insertOrderPaymentSchema = createInsertSchema(orderPaymentTable)
