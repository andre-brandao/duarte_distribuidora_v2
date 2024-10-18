import { t } from '$trpc/t'
import { TRPCError } from '@trpc/server'
import { bugReport } from '$lib/server/db/controller'
import { formated_Permissions } from '$lib/utils/permissions'

// import { allowPermissionsCheck } from '$db/schema'
const admin = t.middleware(async ({ next, ctx }) => {
  const { user } = ctx.locals
  if (user?.role !== 'admin')
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

const logged = t.middleware(async ({ next, path, type, ctx, input, meta }) => {
  const { user } = ctx.locals
  const start = Date.now()

  const result = await next()

  const durationMs = Date.now() - start
  const metaData = { path: path, type: type, durationMs }

  try {
    if (result.ok) {
      console.log('OK request timing:', metaData)
      await bugReport.insertLogs({
        text: `${user?.username ?? 'Anonymous'} acabou de ${meta?.routeName ?? path} time: ${durationMs}`,
        created_by: user?.id ?? undefined,
        metadata: { metaData, input, type, ctx, path },
        type: 'LOG',
        pathname: path,
        routeName: meta?.routeName,
      })
    } else {
      console.error('Non-OK request timing', meta)
      await bugReport.insertLogs({
        text: `${user?.username ?? 'Anonymous'} acabou de ${meta?.routeName ?? path} time: ${durationMs}`,
        created_by: user?.id ?? undefined,
        metadata: { metaData, input, type, ctx, path },
        type: 'ERROR',
        pathname: path,
        routeName: meta?.routeName,
        error: JSON.stringify(result.error),
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

const checkPermission = t.middleware(async ({ next, ctx, meta }) => {
  const { user } = ctx.locals
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar logado para acessar ' + meta?.routeName,
    })
  }

  if (!meta?.permission) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Entre em contato com o a equipe de desenvolvimento, erro de permissão',
    })
  }
  if (user.role !== 'admin') {
    const requiredPermissions = user.meta.permissions?.includes(
      meta?.permission,
    )
    if (!requiredPermissions) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'Você não tem permissão para acessar ' +
          meta.routeName +
          ' Requer: ' +
          formated_Permissions[meta.permission],
      })
    }
  }

  return next()
})

export const middleware = {
  admin,
  auth,
  logged,
  checkPermission,
  // allowPermissions,
}
