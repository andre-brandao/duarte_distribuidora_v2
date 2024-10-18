<script lang="ts">
  import Loading from '$lib/components/Loading.svelte'
  import { modal, Modal } from '$lib/components/modal'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import type { RouterOutputs } from '$trpc/router'
  import { roleEnum, type Role } from '$lib/utils/permissions'

  type Motoboy = RouterOutputs['auth']['getMotoboys']

  export let motoboys: Motoboy = []
  let filteredMotoboys = motoboys

  let isLoading = false

  let newMotoboy = {
    username: '',
    email: '',
    role: 'motoboy' as Role,
  }
  let errors = {
    emailError: '',
    nameError: '',
  }

  onMount(async () => {
    try {
      isLoading = true
      motoboys = await trpc($page).auth.getMotoboys.query()
      filteredMotoboys = motoboys
      console.log(motoboys)
      isLoading = false
    } catch (error: any) {
      console.error(error.message)
      toast.error(error.message)
      isLoading = false
    }
  })

  let searchTerm = ''

  const searchMotoboys = () => {
    return (filteredMotoboys = motoboys.filter(motoboy => {
      let nome = motoboy.username.toLowerCase()
      return nome.includes(searchTerm.toLowerCase())
    }))
  }

  async function handleInsertMotoboy() {
    if (newMotoboy.username.length < 3) {
      errors.nameError = 'Nome do cliente deve conter mais de 3 caracteres'
      return
    }
    try {
      isLoading = true
      newMotoboy.role = 'motoboy'
      await trpc($page).auth.insertUser.mutate(newMotoboy)
      newMotoboy.username = ''
      newMotoboy.email = ''
      toast.success('Motoboy inserido com sucesso!')
      filteredMotoboys = await trpc($page).auth.getMotoboys.query()
      isLoading = false
    } catch (error: any) {
      toast.error(error.message)
      console.error(error.message)
      isLoading = false
    }
  }

  export let selectedMotoboy: (motoboy: Motoboy[0]) => void
</script>

<Modal title="Motoboys">
  <div class="my-4 flex flex-col gap-4">

    <label class="input input-bordered flex items-center gap-2">
      <input
        type="text"
        class="grow"
        placeholder="Search"
        bind:value={searchTerm}
        on:input={searchMotoboys}
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
    {#if isLoading}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {/if}
    {#if motoboys.length === 0}
      <h1 class="my-2 text-center text-lg">
        Nenhum motoboy cadastrado no sistema
      </h1>
    {/if}
    {#if searchTerm && filteredMotoboys.length === 0}
      <div class="mt-6 flex min-h-40 items-center rounded-lg text-center">
        <div class="mx-auto flex w-full max-w-sm flex-col px-4">
          <div class="mx-auto rounded-full bg-base-200 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h1 class="mt-3 text-lg font-semibold">Nenhum motoboy encontrado</h1>
          <p class="mt-2">
            Sua busca não foi encontrada. Por favor tente novamente.
          </p>
        </div>
      </div>
    {:else}
      {#each filteredMotoboys as motoboy}
        <div
          class="flex flex-col gap-3 rounded-box bg-base-200 p-4 text-center"
        >
          {motoboy.username} - {motoboy.email}
          <button
            class="btn btn-primary"
            on:click={() => {
              selectedMotoboy(motoboy)
              modal.close()
            }}
          >
            selecione
          </button>
        </div>
      {/each}
    {/if}
  </div>
</Modal>
