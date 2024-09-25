import { t } from '$trpc/t'
import { TRPCError } from '@trpc/server'
import { bugReport } from '$lib/server/db/controller'
import type { UserPermissions } from '$lib/server/db/schema'
// import { allowPermissionsCheck } from '$db/schema'
const admin = t.middleware(async ({ next, ctx }) => {
  const { user } = ctx.locals
  if (user?.permissions.role !== 'admin')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be an admin to access this route',
    })
  return next()
})

const auth = t.middleware(async ({ next, ctx }) => {
  const { user } = ctx.locals
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this route',
    })
  }

  return next()
})

const logged = t.middleware(async ({ next, path, type, ctx, input }) => {
  const { user } = ctx.locals
  const start = Date.now()

  const result = await next()

  const durationMs = Date.now() - start
  const meta = { path: path, type: type, durationMs }

  try {
    if (result.ok) {
      console.log('OK request timing:', meta)
      await bugReport.insertLogs({
        text: `${user?.username ?? 'Anonymous'}  ${path} time: ${durationMs}`,
        created_by: user?.id ?? undefined,
        metadata: { meta, input, type, ctx, path },
      })
    } else {
      console.error('Non-OK request timing', meta)
      await bugReport.insertLogs({
        text: `ERROR`,
        created_by: user?.id,
        metadata: meta,
        error: `${path} ${user?.username ?? 'Anonymous'}`,
      })
    }
  } catch (error) {
    console.error(error)
  }

  return result
})

// const allowPermissions = (permissions: UserPermissions['role'][]) => {
//   return t.middleware(async ({ next, ctx }) => {
//     const { user } = ctx.locals

//     if (!user) {
//       throw new TRPCError({
//         code: 'UNAUTHORIZED',
//         message: 'You must be logged in to access this ',
//       })
//     }

//     if (allowPermissionsCheck(user, permissions)) {
//       throw new TRPCError({
//         code: 'UNAUTHORIZED',
//         message: 'You do not have permission to access this ',
//       })
//     }
//     return next()
//   })
// }

export const middleware = {
  admin,
  auth,
  logged,
  // allowPermissions,
}
