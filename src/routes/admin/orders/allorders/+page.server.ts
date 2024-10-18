/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { db } from '$lib/server/db'
import {
  and,
  eq,
  getTableColumns,
  SQL,
  count,
  like,
  gt,
  lt,
  lte,
  sum,
  sql,
} from 'drizzle-orm'
import { customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'

export const load = (async ({ url }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 15)

  const name = searchParams.get('name')
  const dateStart = searchParams.get('start')
  const dateEnd = searchParams.get('end')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  const inicioDia = new Date(Number(dateStart))
  inicioDia.setHours(0, 0, 0, 0)

  const fimDia = new Date(Number(dateEnd))
  fimDia.setHours(23, 59, 59, 999)

  let query = customer
    .getAllOrderInfo()
    .where(
      and(
        name ? like(schema.customerTable.name, `${name}%`) : undefined,

        dateStart && dateEnd
          ? and(
            gte(schema.customerOrderTable.created_at, inicioDia),
            lte(schema.customerOrderTable.created_at, fimDia),
            )
          : undefined,
      ),
    )
    .$dynamic()

  console.log('Date Start:', dateStart, 'Date End:', dateEnd)

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.customerOrderTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await db
      .select({ count: count() })
      .from(schema.customerOrderTable)

    const totalSumResult = await db
      .select({
        totalSum: sql<number>`SUM(${schema.customerOrderTable.total})`,
      })
      .from(schema.customerOrderTable)
      .leftJoin(
        schema.customerTable,
        eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
      )
      .where(
        and(
          name ? like(schema.customerTable.name, `${name}%`) : undefined,
          dateStart && dateEnd
            ? and(
              gte(schema.customerOrderTable.created_at, inicioDia),
              lte(schema.customerOrderTable.created_at, fimDia),
              )
            : undefined,
        ),
      )

    const totalSum = totalSumResult[0]?.totalSum ?? 0

    return { rows: rows ?? [], count: total[0].count, totalSum }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0 }
  }
}) satisfies PageServerLoad
