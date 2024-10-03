<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import type { SelectAddress } from '$lib/server/db/schema'
  import AddAdress from '$lib/components/AddAdress.svelte'

  export let addresses: SelectAddress[] = []
  export let selectedAddress: (address: SelectAddress) => void

  function handleAddressAdded(event:any) {
    const { newAddress } = event.detail;
    addresses = [...addresses, newAddress];
    criarEndereco=false
  }

  let criarEndereco = false
</script>

<Modal title="Enderecos">
  <div class="my-4 flex flex-col gap-4">
    {#if criarEndereco}
       <AddAdress customer_id={addresses[0].customer_id} on:addressAdded={handleAddressAdded}/>
       {:else}
       <span>
         Deseja adicionar um novo endereço para esse cliente? <button on:click={()=> criarEndereco=true} class="underline text-info">Clique aqui!</button>
       </span>
    {/if}
    {#if addresses.length>0}
      {#each addresses as addres}
        <div
          class="flex flex-col gap-3 rounded-box bg-base-200 p-4 text-center"
        >
          {addres?.cep}
          {addres?.city}, {addres?.neighborhood}, {addres?.street}, {addres?.number}
          <button
            class="btn btn-primary"
            on:click={() => {
              selectedAddress(addres)
              modal.close()
            }}
          >
            selecione
          </button>
        </div>
      {/each}
    {:else}
      <h1 class="m-6 text-center">Nenhum endereco registrado para esse cliente</h1>
    {/if}
  </div>
</Modal>
