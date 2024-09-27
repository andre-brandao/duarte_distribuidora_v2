import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async () => {
  const delivery_orders = await customer.getDeliveryOrders()
  return {
    delivery_orders,
  }
}) satisfies PageServerLoad
