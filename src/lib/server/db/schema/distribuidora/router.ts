/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { distribuidora as distribuidoraController, stock } from '$db/controller'
import {
  insertCashierSchema,
  cashierTransactionEnum,
} from '$lib/server/db/schema'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '$trpc/middleware'

export const distribuidora = router({
  insertCashier: publicProcedure
    .meta({
      routeName: 'Criar Caixa',
      permission: 'editar_caixas',
    })
    .use(middleware.checkPermission)
    .use(middleware.logged)

    .input(insertCashierSchema)
    .mutation(async ({ input }) => {
      return distribuidoraController.insertCashier(input).returning()
    }),

  updateCashier: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: insertCashierSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      return distribuidoraController.updateCashier(id, data)
    }),

  abrirCaixa: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          amount: z.number(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input
      const { user } = ctx.locals
      await distribuidoraController.insertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: 'Entrada',
        amount: data.amount,
      })
      return await distribuidoraController.updateCashier(id, {
        status: 'Aberto',
      })
    }),
  fecharCaixa: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const { user } = ctx.locals

      const [info] = await distribuidoraController.getCashierById(id)

      await distribuidoraController.justInsertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: 'Saida',
        amount: info.currency,
      })
      return await distribuidoraController.updateCashier(id, {
        status: 'Fechado',
        currency: 0,
      })
    }),

  inserirTransacao: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          amount: z.number(),
          type: z.enum(cashierTransactionEnum),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input
      const { user } = ctx.locals
      await distribuidoraController.insertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: data.type,
        amount: data.amount,
      })
    }),

  getCashierById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const id = input
    return await distribuidoraController.getCashierById(id)
  }),

  deleteCashierById: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await distribuidoraController.deleteCashierById(input)
    }),
})
