<!-- <script lang="ts">
  import type { PageData } from './$types'

  import { getUserContext } from '$lib/stores/user'
  import { Axis, Bars, Chart, Highlight, Svg, Tooltip } from 'layerchart'
  import * as scale from 'd3-scale'
  const user = getUserContext()
  export let data: PageData

  const { customerCount, orderCount, productCount, recentActivity } = data

  const {
    topCustomerOrders,
    topCustomers,
    topOrderedProducts,
    topRevenueProducts,
  } = data.dash
</script>

<div
  class="bg-background flex min-h-[90vh] flex-col items-center justify-center"
>
  <div class="container max-w-4xl space-y-8 px-4 py-12">
    <div class="flex items-center justify-between">
      <h1 class="text-primary-foreground text-4xl font-bold">
        Admin Dashboard
      </h1>
      <h2 class="text-xl">
        Olá, {$user?.username}
      </h2>

    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <a
        href="/admin/customer"
        class=" bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Clientes</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-8 w-8 text-primary"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold">{customerCount}</div>
      </a>
      <a
        href="/admin/products"
        class=" bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Produtos</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-8 w-8 text-primary"
          >
            <path d="m7.5 4.27 9 5.15"></path>
            <path
              d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
            ></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold">{productCount}</div>
      </a>
      <a
        href="/admin/orders"
        class=" bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Orders</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-8 w-8 text-primary"
          >
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path
              d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
            ></path>
          </svg>
        </div>
        <div class="text-4xl font-bold">{orderCount}</div>
      </a>
      <a
        href="/admin/stock"
        class=" bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Estoque</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-8 w-8 text-primary"
          >
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold">{orderCount}</div>
      </a>
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <a
        href="/admin/logs"
        class=" bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <h2 class="text-2xl font-bold">Event Logs</h2>
        <div class="space-y-4">
          {#each recentActivity as act}
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <div class="font-medium">
                    {new Date(act.created_at ?? '').toLocaleString()}
                  </div>
                  <div class="text-muted-foreground text-sm">
                    {act.text}
                  </div>
                </div>
              </div>
         
            </div>
          {/each}
        </div>
      </a>
      <div
        class="text-card-foreground space-y-4 rounded-lg border bg-base-200 p-6 shadow-sm"
      >
        <h2 class="text-2xl font-bold">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4">
          <a class="btn btn-primary" href="/myprofile">Settings</a>
          <a class="btn btn-primary" href="/admin/cashier">Caixa</a>
          {#if $user?.meta.role === 'admin'}
            <a class="btn btn-primary" href="/admin/users">Users</a>
          {/if}
        </div>
      </div>
    </div>

    <div>
      Top Clientes por Gastos
      <div class="group h-[300px] rounded border p-4">
        <Chart
          
          data={topCustomers}
          x="total_spent"
          xDomain={[0, null]}
          xNice
          y="customer_name"
          yScale={scale.scaleBand().padding(0.2)}
          padding={{ left: 46, bottom: 24 }}
          tooltip={{ mode: 'band' }}
        >
          <Svg>
            <Axis
              placement="bottom"
              grid
              rule
              format={d => `R$${(d / 100).toFixed(2)}`}
            />
            <Axis placement="left" format={d => d} rule />
            <Bars
              radius={4}
              strokeWidth={1}
              class="fill-primary transition-colors group-hover:fill-gray-300"
            />
            <Highlight
              area
              bar={{ class: 'fill-primary', strokeWidth: 1, radius: 4 }}
            />
          </Svg>
          <Tooltip.Root let:data>
            {@const total_spend = (data.total_spent / 100).toFixed(2)}
            <Tooltip.Header>
              {data.customer_name}
            </Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Email" value={data.customer_email} />
              <Tooltip.Item label="Phone" value={data.customer_phone} />

              <Tooltip.Item label="Gastos" value={`R$${total_spend}`} />
            </Tooltip.List>
          </Tooltip.Root>
        </Chart>
      </div>
    </div>

    <div>
      Top Clientes por Quantidade de Pedidos
      <div class="group h-[300px] rounded border p-4">
        <Chart
          
          data={topCustomerOrders}
          x="total_orders"
          xDomain={[0, null]}
          xNice
          y="customer_name"
          yScale={scale.scaleBand().padding(0.2)}
          padding={{ left: 46, bottom: 24 }}
          tooltip={{ mode: 'band' }}
        >
          <Svg>
            <Axis
              placement="bottom"
              grid
              rule
              format={d => `R$${(d / 100).toFixed(2)}`}
            />
            <Axis placement="left" format={d => d} rule />
            <Bars
              radius={4}
              strokeWidth={1}
              class="fill-primary transition-colors group-hover:fill-gray-300"
            />
            <Highlight
              area
              bar={{ class: 'fill-primary', strokeWidth: 1, radius: 4 }}
            />
          </Svg>
          <Tooltip.Root let:data>
            {@const total_spend = data.total_orders}
            <Tooltip.Header>
              {data.customer_name}
            </Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Email" value={data.customer_email} />
              <Tooltip.Item label="Phone" value={data.customer_phone} />

              <Tooltip.Item label="Pedidos" value={`${total_spend}`} />
            </Tooltip.List>
          </Tooltip.Root>
        </Chart>
      </div>
    </div>
  </div>
</div> -->
