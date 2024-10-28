/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { and, eq, getTableColumns, SQL, count, like } from 'drizzle-orm'

export const load = (async ({ url,locals:{tenantDb} }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 10)

  const username = searchParams.get('username')
  const email = searchParams.get('email')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  let query = tenantDb!
    .select()
    .from(schema.userTable)
    .where(
      and(
        username ? like(schema.userTable.username, `${username}%`) : undefined,
        email ? like(schema.userTable.email, `${email}%`) : undefined,
      ),
    )
    .$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.userTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!.select({ count: count(schema.userTable.id) }).from(schema.userTable)

    return { rows: rows ?? [], count: total[0].count }
    console.log('total',total)
    
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad