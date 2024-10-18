import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'

import { product as productController } from '$db/controller'

import {
  insertProductCategorySchema,
  insertProductItemSchema,
  insertProductSchema,
} from '$db/schema'

// import { tableHelper } from '$db/utils'
import { paramsSchema } from '$lib/components/table'
import { middleware } from '$trpc/middleware'

export const product = router({
  // paginatedProducts: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       productController.getProducts().$dynamic(),
  //       productController.tables.productTable,
  //       'name',
  //       input,
  //     )
  //   }),
  // paginatedProductItems: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       productController.getProductItems().$dynamic(),
  //       productController.tables.productItemTable,
  //       'name',
  //       input,
  //     )
  //   }),

  insertProduct: publicProcedure
    .input(insertProductSchema)
    .use(middleware.logged)
    .use(middleware.auth)
    //.use(middleware.allowPermissions(['admin', 'user']))

    .mutation(async ({ input }) => {
      return await productController.insertProduct(input).returning()
    }),
  updateProduct: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          image: z.number().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, prod } = input

      return await productController.updateProduct(id, prod).returning()
    }),
  deleteProduct: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input }) => {
      return await productController.deleteProduct(input)
    }),

  insertProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(insertProductItemSchema)
    .mutation(async ({ input }) => {
      return await productController.insertProductItem(input)
    }),
  updateProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string().optional(),
          sku: z.string().optional(),
          quantity: z.number().optional(),
          wholesale_price: z.number().optional(),
          retail_price: z.number().optional(),
          image: z.number().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, prod } = input
      return await productController.updateProductItem(id, prod).returning()
    }),
  deleteProductItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input }) => {
      return await productController.deleteProductItem(input)
    }),

  insertProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(insertProductCategorySchema)
    .mutation(async ({ input }) => {
      return await productController.insertProductCategory(input).returning()
    }),
  updateProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(
      z.object({
        id: z.number(),
        prod: z.object({
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, prod } = input
      return await productController.updateProductCategory(id, prod)
    }),
  deleteProductCategory: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(z.number())
    .mutation(async ({ input }) => {
      return await productController.deleteProductCategory(input)
    }),
})
