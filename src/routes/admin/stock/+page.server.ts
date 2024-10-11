/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy2,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { db } from '$lib/server/db'
import { and, eq, getTableColumns, SQL, count, like } from 'drizzle-orm'

export const load = (async ({ url }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 10 )

  const name = searchParams.get('name')
  // const email = searchParams.get('email')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  let query = db
    .select()
    .from(schema.skuTable)
    .where(name ? like(schema.skuTable.name, `${name}%`) : undefined)
    .$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy2(
      query,
      getSQLiteColumn(schema.skuTable, sortId),
      sortOrder,
    )
  }

    //TODO: FIX não aparece todos SKU, ao filtrar sim

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await db.select({ count: count() }).from(schema.skuTable)

    return { rows: rows ?? [], count: total[0].count }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad