import type { PageServerLoad } from './$types'

import { product } from '$db/controller'
import { error } from '@sveltejs/kit'

export const load = (async ({ params, locals: { tenantDb } }) => {
  const id = Number(params.id)
  const produto = await product(tenantDb!).getVisibleProducts(id)
  console.log(produto)

  if (!produto) {
    error(404, 'Produto não encontrado')
  }
  return { produto }
}) satisfies PageServerLoad
