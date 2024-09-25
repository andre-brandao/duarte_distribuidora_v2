/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker'
import { hash } from '@node-rs/argon2'
import { generateId } from 'lucia'
import { product, user, distribuidora, customer, stock } from './controller'

const main = async () => {
  await seedUsers()
  // await seedCategories()
  // await seedProducts()
  // await seedCustomers()

  // await seedOrders()
}
main()

async function seedUsers() {
  console.log('userTable seed START')

  try {
    await user.insertUser({
      id: generateId(15),
      username: 'administrator',
      email: 'admin@admin.com',
      permissions: {
      },
      role:'admin',
      password_hash: await hash('senha123', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
    })
  } catch (error) {
    console.error('Failed to insert administrator:', error)
  }

  // for (let i = 0; i < 20; i++) {
  //   try {
  //     await user.insertUser({
  //       id: generateId(15),
  //       username: faker.internet.userName(),
  //       email: faker.internet.email(),
  //       permissions: {
  //         role: 'user',
  //       },
  //       password_hash: await hash('password', {
  //         memoryCost: 19456,
  //         timeCost: 2,
  //         outputLen: 32,
  //         parallelism: 1,
  //       }),
  //     })
  //   } catch (error) {
  //     console.error(`Failed to insert user ${i}:`, error)
  //   }
  // }

  console.log('userTable seed END')
}

async function seedCategories() {
  console.log('categoryTable seed START')

  for (let i = 0; i < 10; i++) {
    try {
      await product.insertProductCategory({
        name: faker.commerce.department(),
      })
    } catch (error) {
      console.error(`Failed to insert category ${i}:`, error)
    }
  }

  console.log('categoryTable seed END')
}

async function seedSKU(data: { sku: string; name: string }) {
  await stock.insertSKU(data)
}

async function seedProducts() {
  console.log('productTable seed START')

  for (let i = 0; i < 20; i++) {
    try {
      await product.insertProduct({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category_id: i,
      })
    } catch (error) {
      console.error(`Failed to insert product ${i}:`, error)
    }
  }

  for (let i = 0; i < 20; i++) {
    try {
      const sku = generateId(15)
      const name = faker.commerce.productName()
      await stock.insertSKU({
        sku: sku,
        name: name,
      })
      await product.insertProductItem({
        product_id: i,
        name: name,
        retail_price: faker.number.int({ min: 0, max: 30000 }),
        wholesale_price: faker.number.int({ min: 0, max: 30000 }),
        sku: sku,
      })

      await product.insertProductItem({
        product_id: i,
        name: faker.commerce.productName(),
        retail_price: faker.number.int({ min: 0, max: 30000 }),
        wholesale_price: faker.number.int({ min: 0, max: 30000 }),
      })
    } catch (error) {
      console.error(`Failed to insert product item ${i}:`, error)
    }
  }

  console.log('productTable seed END')
}

async function seedCustomers() {
  console.log('customerTable seed START')

  for (let i = 0; i < 20; i++) {
    try {
      const [cust] = await customer
        .insertCustomer({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          is_retail: faker.datatype.boolean(),
        })
        .returning()

      await customer.insertAddress({
        cep: faker.location.zipCode(),
        street: faker.location.street(),
        city: faker.location.city(),
        state: faker.location.state(),
        customer_id: cust.id,
        complement: faker.location.secondaryAddress(),
        country: faker.location.country(),
        neighborhood: faker.location.county(),
        number: faker.number.int().toString(),
      })
    } catch (error) {
      console.error(`Failed to insert customer ${i}:`, error)
    }
  }

  console.log('customerTable seed END')
}

async function seedOrders() {
  for (let i = 0; i < 20; i++) {
    try {
      await customer.insertOrder({
        order_info: {
          total: faker.number.int({ min: 0, max: 30000 }),
        },
        order_items: [
          {
            product_id: 1,
            price: faker.number.int({ min: 0, max: 30000 }),
            quantity: faker.number.int({ min: 0, max: 30000 }),
          },
        ],
        payment_info: {
          payment_status: 'PENDING',
        },
      })
    } catch (error) {
      console.error(`Failed to insert order ${i}:`, error)
    }
  }
}
