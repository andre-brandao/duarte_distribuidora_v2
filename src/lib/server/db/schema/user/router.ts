import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'

import { user as userController } from '$db/controller'
import { lucia } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'
// import { hash, verify } from '@node-rs/argon2'

// import { generateId } from 'lucia'
// import { LibsqlError } from '@libsql/client'
import { middleware } from '$trpc/middleware'

import { emailTemplate, sendMail } from '$lib/server/email'
import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'
import { userTable } from '$lib/server/db/schema'

export const auth = router({
  logOut: publicProcedure.query(async ({ ctx }) => {
    const { cookies } = ctx
    const { session } = ctx.locals
    if (!session) {
      return {
        error: 'Not authenticated',
      }
    }
    await lucia.invalidateSession(session.id)
    const sessionCookie = lucia.createBlankSessionCookie()
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })

    return redirect(302, '/login')
  }),

  resendEmailVerification: publicProcedure.query(async ({ ctx }) => {
    const { locals } = ctx

    const localUser = locals.user

    if (!localUser) {
      return {
        message: 'Not authenticated',
      }
    }

    const verificationCode = await userController.generateEmailVerificationCode(
      localUser.id,
      localUser.email,
    )
    await sendMail(
      localUser.email,
      emailTemplate.verificationCode(verificationCode),
    )

    return {
      message: 'Verification email sent',
    }
  }),

  verifyEmail: publicProcedure
    .use(middleware.logged)

    .input(
      z.object({
        code: z.string().length(8),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cookies, locals } = ctx
      const sessionId = locals.session?.id
      const { code } = input

      if (!sessionId) {
        return {
          error: 'Not authenticated',
          data: null,
        }
      }

      const { user } = await lucia.validateSession(sessionId)
      if (!user) {
        return {
          error: 'Not authenticated',
          data: null,
        }
      }

      const validCode = await userController.verifyVerificationCode(user, code)

      if (!validCode) {
        return {
          error: 'Invalid code',
          data: null,
        }
      }

      await lucia.invalidateUserSessions(user.id)
      await userController.updateUser(user.id, {
        emailVerified: true,
      })

      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      })

      return {
        data: {
          message: 'Email verified',
          success: true,
        },
        error: null,
      }
    }),
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const { email } = input
      const { url } = ctx

      // const user = await db.table('user').where('email', '=', email).get()
      const [{ id: userID }] = await userController.getUserByEmail(email)
      if (!userID) {
        // If you want to avoid disclosing valid emails,
        // this can be a normal 200 response.
        return {
          error: 'Invalid email',
          data: null,
        }
      }

      const verificationToken =
        await userController.createPasswordResetToken(userID)
      // const verificationLink =
      //   'http://localhost:3000/reset-password/' + verificationToken
      const verificationLink = `${url.origin}/reset-password/${verificationToken}`

      // await sendPasswordResetToken(email, verificationLink)
      await sendMail(email, emailTemplate.resetPassword(verificationLink))
      return {
        data: 'Password reset email sent, Check your email',
        error: null,
      }
    }),
  sendMagicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const { email } = input
      const { url } = ctx

      const [{ id: userId }] = await userController.getUserByEmail(email)

      if (!userId) {
        return {
          message: 'Invalid email',
          success: false,
        }
      }

      const verificationToken = await userController.createMagicLinkToken(
        userId,
        email,
      )
      const verificationLink = `${url.origin}/login/${verificationToken}`
      await sendMail(email, emailTemplate.magicLink(verificationLink))
      return {
        message: 'Magic link sent, Check your email',
        success: true,
      }
    }),

  paginatedUsers: publicProcedure
    .use(middleware.admin)
    .input(paramsSchema)
    .query(async ({ input }) => {
      return await tableHelper(
        userController.getPublicUsersInfo().$dynamic(),
        userTable,
        'username',
        input,
      )
    }),

  updateUserPermissions: publicProcedure
    .use(middleware.admin)
    .input(
      z.object({
        userId: z.string(),
        meta: z.object({
          redirect: z.string().optional(),
          permissions: z.array(z.enum([ 'receber_fiado','editar_produtos','editar_estoque','ver_relatorios','customer','motoboy','editar_caixas']))
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, meta } = input
      return await userController.updateUserPermissions(userId, meta)
    }),

    updateUserRole:publicProcedure
    .use(middleware.admin)
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['admin', 'employee', 'customer', 'motoboy', 'caixa']),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId,role } = input
      return await userController.updateUserRole(userId, role)
    }),

    getMotoboys: publicProcedure.query(() => {
      return userController.getMotoboys()
    }),
})
