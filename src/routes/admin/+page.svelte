<script lang="ts">
  import type { PageData } from './$types'

  import { getUserContext } from '$lib/stores/user'
  const user = getUserContext()
  export let data: PageData
  import * as m from '$msgs'

  const { customerCount, orderCount, productCount, recentActivity } = data
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
      <!-- <div class="flex items-center space-x-4">
        <button
          class="ring-offset-background focus-visible:ring-ring hover:text-accent-foreground inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
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
            class="h-6 w-6"
          >
            <rect width="16" height="13" x="6" y="4" rx="2"></rect>
            <path d="m22 7-7.1 3.78c-.57.3-1.23.3-1.8 0L6 7"></path>
            <path d="M2 8v11c0 1.1.9 2 2 2h14"></path>
          </svg>
          <span class="sr-only">Notifications</span>
        </button>
        <span
          class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border"
        >
          <img
            class="aspect-square h-full w-full"
            alt="Admin Avatar"
            src="/placeholder-user.jpg"
          />
        </span>
      </div> -->
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <a
        href="/admin/customer"
        class=" bg-card text-card-foregrouAnalyticsnd space-y-4 rounded-lg border p-6 shadow-sm hover:bg-base-200"
        data-v0-t="card"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">{m.customers()}</h2>
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
          <h2 class="text-2xl font-bold">{m.products()}</h2>
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
              <!-- <div class="text-muted-foreground text-sm">
                {JSON.stringify(act.metadata, null, 2)}
              </div> -->
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
  </div>
</div>
