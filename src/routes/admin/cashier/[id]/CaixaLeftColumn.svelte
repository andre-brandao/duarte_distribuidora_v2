<script lang="ts">
  import ModalEndereco from './ModalEndereco.svelte'
  import ModalCliente from './ModalCliente.svelte'
  import { modal } from '$lib/components/modal'
  import { getCartContext } from '$lib/stores/cart'
  import { icons } from '$lib/utils/icons'
  import type { RouterOutputs } from '$trpc/router'
  import ModalMotoboy from './ModalMotoboy.svelte'

  export let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'
  export let caixa
  export let clienteSelecionado:
    | RouterOutputs['customer']['getCustomers'][0]
    | null = null

  export let enderecoCliente:
    | RouterOutputs['customer']['getCustomers'][0]['adresses'][0]
    | null = null

  export let user

  export let motoboySelecionado:
    | RouterOutputs['auth']['getMotoboys'][0]
    | null = null

  export let isDelivery = false
  const cart = getCartContext()

  function handleSelectClient() {
    modal.open(ModalCliente, {
      selectedClient: client => {
        clienteSelecionado = client
        modal.open(ModalEndereco, {
          addresses: client.adresses,
          selectedAddress: address => {
            enderecoCliente = address
            //TODO:ARRUMAR TIPO
            console.log(address)
          },
        })
        if (clienteSelecionado.is_retail) {
          tipo_preco = 'retail_price'
        } else {
          tipo_preco = 'wholesale_price'
        }
      },
    })
  }

  function handleSelectMotoboy() {
    modal.open(ModalMotoboy, {
      selectedMotoboy: motoboy => {
        motoboySelecionado = motoboy
      },
    })
  }
  function toggleDelivery() {
    isDelivery = !isDelivery

    if (!isDelivery) {
      motoboySelecionado = null
    }
  }
</script>

<div class="flex h-auto flex-col-reverse justify-between md:flex-col">
  <h2 class="mb-2 hidden text-3xl font-bold md:block">
    Informações do pedido:
  </h2>
  <!-- <p>
      Número do pedido: <span class="font-bold text-primary">
        #{caixa.id}
      </span>
    </p> -->
    <p>
      Criado por: <span class="font-bold text-success">{user?.email}</span>
    </p>
  <div>
    <!-- <h1 class="text-center mt-2">Selecione o tipo de preco</h1> -->
    <div class="flex w-full flex-col lg:flex-row mt-2">
      <div class="grid flex-grow place-items-center">
        <button
          class="btn btn-primary w-full"
          on:click={() => {
            tipo_preco = 'retail_price'
          }}
          disabled={tipo_preco === 'retail_price' ||
            Object.values($cart).length >= 1}
        >
          Varejo
        </button>
      </div>
      <div class="divider lg:divider-horizontal">OU</div>
      <div class="grid flex-grow place-items-center">
        <button
          class="btn btn-primary w-full"
          on:click={() => {
            tipo_preco = 'wholesale_price'
          }}
          disabled={tipo_preco === 'wholesale_price' ||
            Object.values($cart).length >= 1}
        >
          Atacado
        </button>
      </div>
    </div>

  </div>
  <!-- <div
    class="mt-3 hidden w-full rounded-lg px-3 py-1 text-center font-bold md:block {caixa.status ===
    'Aberto'
      ? 'bg-success'
      : 'bg-error'}"
  >
    {caixa.status === 'Aberto' ? 'Em aberto' : 'Fechado'}
  </div> -->
  <div class="flex flex-col-reverse gap-2 md:flex-col mt-2">
    <div class=" rounded-box bg-base-200 p-4">
      {#if clienteSelecionado}
        <div class="flex items-center justify-between gap-2">
          <p class="font-bold">{clienteSelecionado.name} - {clienteSelecionado.email}</p>
          <button
            class="btn btn-primary"
            on:click={() => {
              clienteSelecionado = null
              enderecoCliente = null
            }}
          >
            Desvincular
          </button>
        </div>
      {:else}
        <button
          class="btn btn-outline w-full disabled:bg-opacity-50"
          on:click={handleSelectClient}
        >
          <span class="mr-1">Vincular compra a um cliente</span>
        </button>
      {/if}
      {#if enderecoCliente}
        <div class="max-w-[50vh] flex-wrap items-center justify-between mt-2">
         <strong>Endereço:</strong>  {enderecoCliente?.cep}
          {enderecoCliente?.city}, {enderecoCliente?.neighborhood}, {enderecoCliente?.street},
          {enderecoCliente?.number}
        </div>
      {/if}
    </div>
    <div class="my-1 flex flex-col items-center justify-center gap-1">
      {#if clienteSelecionado && enderecoCliente}
        <div class="flex items-center justify-center gap-3">
          <h1>É um pedido delivery?</h1>
          <input
            type="checkbox"
            class="toggle toggle-success"
            checked={isDelivery}
            on:click={toggleDelivery}
          />
        </div>
      {/if}
      {#if isDelivery && clienteSelecionado}
        {#if motoboySelecionado}
          <div class="m-2 flex w-full items-center justify-center gap-3">
            <p>
              Motoboy: <strong>{motoboySelecionado.username}</strong>
            </p>
            <button
              class="btn btn-accent"
              on:click={() => {
                motoboySelecionado = null
                isDelivery = false
              }}
            >
              Desvincular
            </button>
          </div>
        {:else}
          <button class="btn btn-outline w-full" on:click={handleSelectMotoboy}>
            Selecione o motoboy
          </button>
        {/if}
      {/if}
    </div>
    <a
      href="/admin/cashier"
      class="btn btn-primary w-full disabled:bg-opacity-50"
      on:click={() => cart.set({})}
    >
      <span class="mr-1">CANCELAR</span>
      {@html icons.x()}
    </a>
  </div>
</div>
