/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  stockTransactionTable,
  supplierTable,
  cashierTransactionTable,
} from '$db/schema'

import type {
  SelectProductItem,
  InsertStockTransaction,
  SelectSku,
  InsertSku,
  SelectStockTransaction,
  SelectSupplier,
  InsertSupplier,
} from '$db/schema'

import { db } from '$db'
import { and, desc, eq, gt, ne, sql } from 'drizzle-orm'
import { LibsqlError } from '@libsql/client'

function insertSKU(data: InsertSku) {
  return db.insert(skuTable).values(data)
}
function getSKU() {
  return db.select().from(skuTable)
}

function getSKUWithStock() {
  return db.select().from(skuTable)
}

function getSKUByID(sku_id: SelectSku['sku']) {
  return db.query.skuTable.findFirst({
    where: eq(skuTable.sku, sku_id),
  })
}

function deleteItemStock(sku: SelectSku['sku']) {
  return db.delete(skuTable).where(eq(skuTable.sku, sku))
}

function getTransactionsFromProduto(data: { sku: SelectSku['sku'] }) {
  const { sku } = data
  return db
    .select()
    .from(stockTransactionTable)
    .where(eq(stockTransactionTable.sku, sku))
}

async function insertStockTransaction(
  data: Omit<InsertStockTransaction, 'total_log'>,
) {
  const { sku } = data
  return await db.transaction(async trx => {
    const [resp] = await trx
      .update(skuTable)
      .set({
        quantity: sql`${skuTable.quantity} + ${data.quantity}`,
      })
      .where(eq(skuTable.sku, sku))
      .returning()
    await trx.insert(stockTransactionTable).values({
      ...data,
      total_log: resp.quantity,
    })
  })
}

function insertSupplier(data: InsertSupplier) {
  return db.insert(supplierTable).values(data)
}

function getSupplier() {
  return db.select().from(supplierTable)
}

function updateSupplier(
  id: SelectSupplier['id'],
  supplier: Partial<SelectSupplier>,
) {
  return db
    .update(supplierTable)
    .set(supplier)
    .where(eq(supplierTable.id, id))
    .run()
}

function queryLastCostPrice(sku: SelectSku['sku']) {
  return db.query.stockTransactionTable.findFirst({
    where: t => and(eq(t.sku, sku), eq(t.type, 'Entrada'), gt(t.cost_price, 0)),
    columns: {
      cost_price: true,
    },
    orderBy: [desc(stockTransactionTable.created_at)],
  })
}

function getRecentTransactionsCaixa(id: number) {
  return db
    .select()
    .from(cashierTransactionTable)
    .where(eq(cashierTransactionTable.cachier_id, id))
    .orderBy(desc(cashierTransactionTable.created_at))
    .limit(15)
}

function getAllTransactionsCaixa() {
  return db
    .select()
    .from(cashierTransactionTable)
    .orderBy(desc(cashierTransactionTable.created_at))
}

export const stock = {
  tables: {
    skuTable,
  },
  insertSKU,
  getSKU,
  getSKUByID,
  getSKUWithStock,
  getTransactionsFromProduto,
  insertStockTransaction,
  insertSupplier,
  getSupplier,
  queryLastCostPrice,
  getRecentTransactionsCaixa,
  getAllTransactionsCaixa,
  deleteItemStock,
  updateSupplier,
}
