import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async () => {
  redirect(303, '/admin/dashboard/vendas')
  return {}
}) satisfies PageServerLoad
