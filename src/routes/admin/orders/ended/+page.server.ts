import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async () => {
  const ended_orders = await customer.getEndedOrders()
  return {
    ended_orders,
  }
}) satisfies PageServerLoad
