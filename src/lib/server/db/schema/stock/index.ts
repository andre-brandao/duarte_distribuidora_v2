/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
  unique,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'
import { imageTable } from '../image'

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import {
  customerOrderTable,
  productItemTable,
  productTable,
  userTable,
} from '$db/schema'

export const skuTable = sqliteTable('estoque', {
  sku: text('sku').primaryKey(),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => new Date()),
  image: integer('image_id').references(() => imageTable.id),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(0),
})

export const skuRelations = relations(skuTable, ({ many, one }) => ({
  products: many(productItemTable),
  transactions: many(stockTransactionTable),
}))

export const insertSKUschema = createInsertSchema(skuTable)
export type InsertSku = typeof skuTable.$inferInsert
export type SelectSku = typeof skuTable.$inferSelect

export type metaEntrada = {
  type: 'entrada'
  nota_fiscal: string
  user_id: string | null | undefined
}

export type metaSaida = {
  type: 'saida'
  order_id: number
}

export type MetaUnion = metaEntrada | metaSaida
// function isMetaEntrada(meta: MetaUnion): meta is metaEntrada {
//   return meta.type === 'entrada'
// }

// function isMetaSaida(meta: MetaUnion): meta is metaSaida {
//   return meta.type === 'saida'
// }
export const stockTransactionTable = sqliteTable('transacao_estoque', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(
    sql`(CURRENT_TIMESTAMP)`,
  ),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  sku: text('sku')
    .notNull()
    .references(() => skuTable.sku),
  quantity: integer('quantity').notNull(),
  type: text('type', { enum: ['Entrada', 'Saida'] }).notNull(),
  supplier_id: integer('supplier_id').references(() => supplierTable.id),
  order_id: integer('order_id').references(() => customerOrderTable.id),
  cost_price: integer('cost_price'),
  meta_data: text('meta_data', { mode: 'json' }).notNull().$type<MetaUnion>(),

  total_log: integer('total_log').notNull(),
})

export const stockTransactionRelations = relations(
  stockTransactionTable,
  ({ one, many }) => ({
    sku: one(skuTable, {
      fields: [stockTransactionTable.sku],
      references: [skuTable.sku],
    }),
    supplier: one(supplierTable, {
      fields: [stockTransactionTable.supplier_id],
      references: [supplierTable.id],
    }),
    order: one(customerOrderTable, {
      fields: [stockTransactionTable.order_id],
      references: [customerOrderTable.id],
    }),
  }),
)

export type InsertStockTransaction = typeof stockTransactionTable.$inferInsert
export type SelectStockTransaction = typeof stockTransactionTable.$inferSelect

export const supplierTable = sqliteTable('fornecedor', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(
    sql`(CURRENT_TIMESTAMP)`,
  ),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  razao_social: text('razao_social'),
  cnpj_cpf: text('cnpj_cpf'),
  ie_rg: text('ie_rg'),
  telephone_1: text('telephone_1'),
  telephone_2: text('telephone_2'),
  cep: text('cep'),
})

export const supplierRelations = relations(supplierTable, ({ one, many }) => ({
  transactions: many(stockTransactionTable),
}))

export type InsertSupplier = typeof supplierTable.$inferInsert
export type SelectSupplier = typeof supplierTable.$inferSelect
export const insertSupplierSchema = createInsertSchema(supplierTable)
