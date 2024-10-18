import type { PageServerLoad } from './$types'

import { distribuidora } from '$db/controller'
import { db } from '$lib/server/db'
import { deliveryFeeTable } from '$lib/server/db/schema'

export const load = (async () => {
  const distribuidoras = await distribuidora.getCashier()
  const taxa = await db.select().from(deliveryFeeTable)
  return {
    distribuidoras,
    taxa
  }
}) satisfies PageServerLoad
