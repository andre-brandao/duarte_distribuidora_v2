/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  cashierTable,
  cashierTransactionTable,
  stockTransactionTable,
} from '$db/schema'

import type {
  SelectCashier,
  InsertCashier,
  SelectCashierTransaction,
  InsertCashierTransaction,
} from '$db/schema'

import { db } from '$db'
import { eq, sql } from 'drizzle-orm'



function insertCashier(data: InsertCashier) {
  return db.insert(cashierTable).values(data)
}

function getCashier() {
  return db.select().from(cashierTable)
}
function getCashierById(id: SelectCashier['id']) {
  return db.select().from(cashierTable).where(eq(cashierTable.id, id)).limit(1)
}

function deleteCashierById(id:SelectCashier['id']){
  return db.delete(cashierTable).where(eq(cashierTable.id,id))
}

function insertCashierTransaction(data: InsertCashierTransaction) {
  return db.transaction(async trx => {
    await trx.insert(cashierTransactionTable).values(data)
    await trx
      .update(cashierTable)
      .set({
        currency: sql`${cashierTable.currency} + ${data.amount}`,
      })
      .where(eq(cashierTable.id, data.cashier_id))
  })
}

function getCashierTransactions(cachier_id: SelectCashier['id']) {
  return db
    .select()
    .from(cashierTransactionTable)
    .where(eq(cashierTransactionTable.cashier_id, cachier_id))
}

function updateCashier(id: SelectCashier['id'], data: Partial<SelectCashier>) {
  return db.update(cashierTable).set(data).where(eq(cashierTable.id, id))
}

export const distribuidora = {

  insertCashier,
  getCashier,
  getCashierById,
  insertCashierTransaction,
  getCashierTransactions,
  updateCashier,
  deleteCashierById
}
