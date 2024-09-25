import type { PageServerLoad } from './$types'
import { customer } from '$db/controller'
export const load = (async () => {
  const count = await customer.countFiadoTransactions(2)
  const credit = await customer.getCustomerUsedCredit(2)
  const customerData = await customer.getCustomerById(2)
  return {
    count,
    credit,
    customerData,
  }
}) satisfies PageServerLoad
