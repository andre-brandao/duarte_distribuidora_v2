<script lang="ts">
  import { modal, Modal } from '$lib/components/modal'
  import type { SelectCustomer } from '$db/schema'
  import AddAdress from '../AddAdress.svelte'

  export let customer_id: SelectCustomer['id']

</script>

<Modal title="Cadastre um endereco para o cliente">
  <AddAdress {customer_id} on:addressAdded={()=> {
    modal.close()
    window.location.reload()
  }}/>
</Modal>
