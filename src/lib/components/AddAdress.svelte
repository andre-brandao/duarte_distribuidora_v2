<script lang="ts">
  import { modal, Modal } from '$lib/components/modal'
  import { icons } from '$lib/utils'
  import { getEnderecoFromCEP } from '$lib/utils/cep'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { toast } from 'svelte-sonner'
  import type { SelectCustomer } from '$db/schema'
  import * as m from '$msgs'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let formEndereco = {
    number: '',
    id: '',
    created_at: '',
    updated_at: '',
    customer_id: '',
    cep: '',
    street: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: '',
  }

  let disabled = false

  export let customer_id: SelectCustomer['id']

  const save = () => {
    addAddress()
    // modal.close()
  }

  async function addAddress() {
    try {
      await trpc($page).customer.insertAddress.mutate({
        customer_id: customer_id,
        cep: formEndereco.cep,
        street: formEndereco.street,
        number: formEndereco.number,
        complement: formEndereco.complement,
        neighborhood: formEndereco.neighborhood,
        city: formEndereco.city,
        state: formEndereco.state, //select
        country: 'BR',
      })
      toast.success('Endereco adicionado com sucesso!')

      dispatch('addressAdded', {
        customer_id,
        newAddress: formEndereco})
    //   window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
      return error.message
    }
  }

  async function handleCep(cep: string) {
    const responseapi = await getEnderecoFromCEP(cep)
    if (responseapi.bairro) {
      formEndereco.neighborhood = responseapi.bairro
    }
    if (responseapi.logradouro) {
      formEndereco.street = responseapi.logradouro
    }
    if (responseapi.uf) {
      formEndereco.state = responseapi.uf
    }
    if (responseapi.localidade) {
      formEndereco.city = responseapi.localidade
    }
    console.log(responseapi)
    disabled = true
  }
</script>

<main class="flex flex-col items-center space-y-4">
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">CEP</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu CEP"
      class="input input-bordered w-full"
      on:change={async e => {
        const value = e.target?.value
        if (value.length === 8) {
          await handleCep(value)
        }
        if (value.length != 8) {
          disabled = false
        }
        console.log(value)
      }}
      bind:value={formEndereco.cep}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Bairro</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Bairro"
      class="input input-bordered w-full"
      bind:value={formEndereco.neighborhood}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Cidade</span>
    </div>
    <input
      type="text"
      placeholder="Digite sua Cidade"
      class="input input-bordered w-full"
      bind:value={formEndereco.city}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Rua</span>
    </div>
    <input
      type="text"
      placeholder="Digite sua Cidade"
      class="input input-bordered w-full"
      bind:value={formEndereco.street}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Estado</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Estado"
      class="input input-bordered w-full"
      bind:value={formEndereco.state}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Numero</span>
    </div>
    <input
      type="text"
      placeholder="Digite seu Numero"
      class="input input-bordered w-full"
      bind:value={formEndereco.number}
    />
  </label>

  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Complemento</span>
    </div>
    <input
      type="text"
      placeholder="Digite o Complemento"
      class="input input-bordered w-full"
      bind:value={formEndereco.complement}
    />
  </label>
</main>

<hr>

<div class="flex w-full justify-end">
  <div class="flex gap-3 w-full">
    <!-- <button class="btn btn-error" on:click={modal.close}>
      {m.cancel_button()}
    </button> -->
    <button class="btn btn-primary w-full" on:click={save}>Salvar novo endereco</button>
  </div>
</div>
