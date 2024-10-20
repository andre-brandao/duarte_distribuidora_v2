import {
  sqliteTable,
  text,
  integer,

  // customType,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { cashierTransactionTable } from '../distribuidora'
import { logsTable } from '../bug-report'
import { customerOrderTable, orderPaymentTable } from '../customer'
import type { Permission, Role } from '$lib/utils/permissions'

export const userTable = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  // .$defaultFn(() => generateId(15)),

  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  password_hash: text('password_hash'),

  role: text('role', {
    enum: ['admin', 'employee', 'customer', 'motoboy', 'caixa'],
  })
    .notNull()
    .default('customer'),
  meta: text('permissions', { mode: 'json' })
    .notNull()
    .$type<UserMeta>()
    .default({}),
})

export const userRelations = relations(userTable, ({ many }) => ({
  cashier_transactions: many(cashierTransactionTable),
  logs: many(logsTable),
  orders_made: many(customerOrderTable, { relationName: 'orders_made' }),
  entregou: many(customerOrderTable, { relationName: 'entregou' }),
  payments_created: many(orderPaymentTable),
}))

export type SelectUser = typeof userTable.$inferSelect
export type InsertUser = typeof userTable.$inferInsert

// import { generateId } from 'lucia'
export interface DatabaseUser {
  id: string
  username: string
  email: string
  emailVerified: boolean
  meta: UserMeta
  role: Role
}

export type UserMeta = {
  redirect?: string
  permissions?: Permission[]
}

export const DEFAULT_PERMISSIONS: UserMeta = {
  redirect: '/',
} as const

// AUTH TABLES
export const sessionTable = sqliteTable('session', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
    }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
export type SelectSession = typeof sessionTable.$inferSelect

export const userVerificationCodeTable = sqliteTable('user_verification_code', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
    }),
  email: text('email').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export const passwordResetCodeTable = sqliteTable('password_reset_code', {
  token_hash: text('token_hash').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
    }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export const magicLinkTable = sqliteTable('magic_link', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'cascade',
    }),
  email: text('email').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
