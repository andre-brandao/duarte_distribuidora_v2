<script lang="ts">
  import { page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { modal } from '$lib/components/modal'
  import type { DatabaseUser } from '$lib/server/db/schema'
  import { permissionsEnum } from '$lib/utils/permissions'
  import type { Permission, Role } from '$lib/utils/permissions'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'

  export let userId: string
  export let userName: string
  export let userPermissions:Permission[]

  let dialog: HTMLDialogElement

  let selectedPermissions: Permission[] = userPermissions

  let isLoading = false

  async function handleUpdateUserPermission() {
    isLoading = true
    try {
      await trpc($page).auth.updateUserPermissions.mutate({
        userId: userId,
        meta: {
          permissions: selectedPermissions,
        },
      })
      toast.success('Permissões editadas com sucesso!')
      setTimeout(() => {
        dialog.close()
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      isLoading = false
      toast.error('Falha ao editar permissões')
      console.error(error.message)
    }
  }
</script>

<button class="btn btn-xs btn-primary" onclick={() => dialog.showModal()}>
  Editar permissões
</button>

<dialog bind:this={dialog} id="my_modal_2" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <h3 class="text-lg font-bold">Edite as permissões de {userName}</h3>
    <h1><strong>Permissões selecionadas do úsuario:</strong> {selectedPermissions.join(', ')}</h1>
    {#if isLoading}
      <div class="my-10 flex items-center justify-center">
        <Loading />
      </div>
    {:else}
      <label class="form-control my-3 w-full">
        <div class="form-control">
          {#each permissionsEnum as permissao}
            <label class="label cursor-pointer">
              <span class="label-text">{permissao}</span>
              <input
                type="checkbox"
                class="checkbox"
                bind:group={selectedPermissions}
                value={permissao}
              />
            </label>
          {/each}
        </div>
      </label>
    {/if}
    <div class="flex justify-end">
      {#if selectedPermissions.length != 0}
        <button
          class="btn btn-primary"
          disabled={isLoading}
          onclick={handleUpdateUserPermission}
        >
          Salvar permissões!
        </button>
      {/if}
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
