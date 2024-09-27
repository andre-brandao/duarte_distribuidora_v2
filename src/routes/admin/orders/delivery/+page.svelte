<script lang="ts">
  import CardShowPedidos from '$lib/components/cards/CardShowPedidos.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let delivery_orders = data.delivery_orders
</script>

{#if delivery_orders}
  <div class="grid grid-cols-3">
    {#each delivery_orders as pedido}
      <CardShowPedidos order={pedido} />
    {/each}
  </div>
{:else}
  <h1 class="m-10 text-center text-xl">Não existe nenhum pedido delivery!</h1>
{/if}
