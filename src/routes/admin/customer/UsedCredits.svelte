<script lang="ts">
  import { trpc } from '$trpc/client'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { resolveHTTPResponse } from '@trpc/server/http'
  import { toast } from 'svelte-sonner'

  export let value = 0
  export let id

  onMount(async () => {
    try {
        const resp = await trpc($page).customer.getCustomerUsedCredits.query(id)
        console.log(resp)
        if(resp){
            value = resp.used_credit
        }
    } catch (error:any) {
        console.error(error.message)
        toast.error(error.message)
    }
  })
</script>

R${(value / 100).toFixed(2)}
