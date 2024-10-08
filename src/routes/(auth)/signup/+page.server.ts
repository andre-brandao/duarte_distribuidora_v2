import { lucia } from '$lib/server/auth'
import { fail, redirect } from '@sveltejs/kit'
import { generateId } from 'lucia'
import { hash } from '@node-rs/argon2'
import { LibsqlError } from '@libsql/client'

import type { Actions, PageServerLoad } from './$types'
import { emailTemplate, sendMail } from '$lib/server/email'

import { bugReport, user } from '$db/controller'

export const load: PageServerLoad = async event => {
  if (event.locals.user) {
    return redirect(302, '/')
  }
  return {}
}

export const actions: Actions = {
  default: async event => {
    const formData = await event.request.formData()
    const username = formData.get('username')
    const password = formData.get('password')
    const email = formData.get('email')
    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      return fail(400, {
        message: 'Invalid username',
      })
    }
    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 255
    ) {
      return fail(400, {
        message: 'Invalid password',
      })
    }
    if (
      typeof email !== 'string' ||
      email.length < 3 ||
      email.length > 255 ||
      !email.includes('@')
    ) {
      return fail(400, {
        message: 'Invalid email',
      })
    }

    try {
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      })
      const userId = generateId(15)
      user.insertUser({
        id: userId,
        username,
        email,
        emailVerified: false,
        password_hash: passwordHash,
        role: username === 'administrador' ? 'admin':'customer',
      })

      const verificationCode = await user.generateEmailVerificationCode(
        userId,
        email,
      )
      await bugReport.insertLogs({
        created_by: userId,
        text: `${username} se cadastrou`,
        error: '',
      })
      await sendMail(email, emailTemplate.verificationCode(verificationCode))

      const session = await lucia.createSession(userId, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
      })
    } catch (e) {
      if (e instanceof LibsqlError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return fail(400, {
          message: 'Username or Email already used',
        })
      }
      console.error(e)
      return fail(500, {
        message: 'An unknown error occurred',
      })
    }
    return redirect(302, '/verify-email')
  },
}
