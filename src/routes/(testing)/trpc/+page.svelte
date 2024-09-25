<script lang="ts">
  import type { PageData } from './$types'
  import { toast } from 'svelte-sonner'

  export let data: PageData

  import { page } from '$app/stores'
  import { trpc } from '$trpc/client'
  let loading = false

  // const loadData = async () => {
  //   loading = true
  //   greeting = await trpc($page).greeting.query()
  //   loading = false
  // }

  async function testFiado() {
    try {
      const resp = await trpc($page).customer.order.insertFiado.mutate({
        order_info: {
          customer_id: 1,
          observation: 'teste',
          total: 2000,
          cachier_id: 1,
          address_id: 1,
        },

        order_items: [
          {
            product_id: 1,
            quantity: 2,
            price: 1000,
          },
        ],
      })
      console.log(resp)
      toast.success('Fiado testado com sucesso')
      toast.success(JSON.stringify(resp, null, 2))
    } catch (error: any) {
      toast.error(error.message)
    }
  }
</script>

<pre>
  {JSON.stringify(data, null, 2)}
</pre>
<div>
  {#if loading}
    Loading...
  {:else}
    <button class="btn" disabled={loading} on:click={testFiado}>
      Test Fiado
    </button>
  {/if}
</div>
