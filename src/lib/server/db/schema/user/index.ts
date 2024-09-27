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

  role: text('role', { enum: ['admin', 'employee', 'customer', 'motoboy'] })
    .notNull()
    .default('customer'),
  permissions: text('permissions', { mode: 'json' })
    .notNull()
    .$type<UserPermissions>()
    .default({}),
})

export const userRelations = relations(userTable, ({  many }) => ({
  cashier_transactions: many(cashierTransactionTable),
  logs: many(logsTable),
  orders_made: many(customerOrderTable),
  entregou: many(customerOrderTable),
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
  permissions: UserPermissions
  role:  'admin'| 'employee'| 'customer'| 'motoboy'
}

export const permissionsEnum = [
  'receber_fiado',
  'editar_produtos',
  'editar_estoque',
  'ver_relatorios',
  'customer',
  'motoboy',
] as const
export type Permission = typeof permissionsEnum[number];

export type UserPermissions = {
  redirect?: string
  permissions?: Permission[]
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
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
  expiresAt: integer('expires_at').notNull(),
})

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
