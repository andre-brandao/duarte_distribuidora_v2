<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import type { PageData } from './$types'
  import { page } from '$app/stores'

  export let data: PageData

  let pedidos_fiados = data.pending_orders
  let filteredPedidos = pedidos_fiados

  let searchTerm = ''

  const searchFiado = () => {
    return (filteredPedidos = pedidos_fiados.filter(pedido => {
      let customerName = pedido.customer?.name.toLowerCase()
      return customerName?.includes(searchTerm.toLowerCase())
    }))
  }

  function calculateDaysDiff(createdAt: string): number {
    const createdDate = new Date(createdAt)
    const today = new Date()
    const diffTime = today.getTime() - createdDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  function getExpirationDate(createdAt: string): string {
    const createdDate = new Date(createdAt)
    const expirationDate = new Date(createdDate)
    expirationDate.setDate(createdDate.getDate() + 7)
    return expirationDate.toLocaleDateString()
  }

  function getDaysToExpiry(createdAt: string): number {
    const createdDate = new Date(createdAt)
    const expirationDate = new Date(createdDate)
    expirationDate.setDate(createdDate.getDate() + 6)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function getBgColor(createdAt: string): string {
    const daysDiff = calculateDaysDiff(createdAt)

    if (daysDiff >= 7) {
      return 'bg-error text-error-content'
    } else if (daysDiff >= 5) {
      return 'bg-warning text-warning-content'
    } else {
      return 'table-zebra'
    }
  }
</script>

<h1 class="my-3 text-center text-3xl">Pedidos com pagamento pendente:</h1>

<div class="mx-3 mb-3 flex justify-end gap-2">
  <label class="input input-bordered flex items-center gap-2">
    <input
      type="text"
      class="grow"
      placeholder="Procurar cliente"
      bind:value={searchTerm}
      on:input={searchFiado}
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      class="h-4 w-4 opacity-70"
    >
      <path
        fill-rule="evenodd"
        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
        clip-rule="evenodd"
      />
    </svg>
  </label>
</div>

<div class="overflow-x-auto">
  {#if searchTerm && filteredPedidos.length === 0}
    <p class="text-center text-xl">
      <strong>Nenhum cliente encontrado.</strong>
       Tente novamente!
    </p>
  {:else}
    {#if pedidos_fiados.length > 0}
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data do Pedido</th>
            <th>Data de Vencimento</th>
            <th>Status Pagamento</th>
            <th>Dias para Vencimento</th>
  
            <th>Cliente</th>
            <th>Total do pedido</th>
  
            <th>Pedido</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredPedidos as fiado}
            <tr class={fiado.created_at ? getBgColor(fiado.created_at) : ''}>
              <td>{fiado.id}</td>
              <td>{fiado.created_at ?? 'Data não disponível'}</td>
              <td>
                {fiado.created_at ? getExpirationDate(fiado.created_at) : 'N/A'}
              </td>
              <td>{fiado.status}</td>
              <td>
                {#if fiado.created_at && getDaysToExpiry(fiado.created_at) >= 0}
                  {getDaysToExpiry(fiado.created_at)} dias
                {:else}
                  Expirado
                {/if}
              </td>
              <td>
                {fiado.customer?.name} - {fiado.customer?.cellphone ??
                  'Telefone sem registro'} - {fiado.customer?.email}
              </td>
              <td class="font-bold">
                R${(fiado.total / 100).toFixed(2)}
              </td>
              <td>
                <a href="/admin/orders/{fiado.id}" class="badge badge-primary">
                  VISUALIZAR PEDIDO
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <h1 class="mt-10 text-center text-4xl">
        Nenhum pagamento está pendente!!!
      </h1>
    {/if}
  {/if}
</div>
