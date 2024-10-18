import type { Context } from '$trpc/context'
import { initTRPC } from '@trpc/server'
// import transformer from 'trpc-transformer';
import superjson from 'superjson'

import type { Permission } from '$lib/utils/permissions'

export interface Meta {
  routeName: string
  permission?: Permission
}

export const t = initTRPC.context<Context>().meta<Meta>().create(
  // { transformer }
  { transformer: superjson },
)

export const router = t.router
export const publicProcedure = t.procedure
