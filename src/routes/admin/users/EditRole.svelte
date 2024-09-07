<script lang="ts">
  import { page } from '$app/stores'
  import Loading from '$lib/components/Loading.svelte'
  import { modal } from '$lib/components/modal'
  import type { UserPermissions } from '$lib/server/db/schema'
  import { trpc } from '$trpc/client'
  import { toast } from 'svelte-sonner'

  export let permissions: UserPermissions
  export let userId: string

  let dialog: HTMLDialogElement
  let selectedRole: UserPermissions['role'] = permissions.role

  let isLoading = false

  async function handleUpdateUserPermission() {
    isLoading = true
    try {
      await trpc($page).auth.updateUserPermissions.mutate({
        userId: userId,
        permissions: {
          role: selectedRole,
        },
      })
      toast.success('Permissões editadas com sucesso!')
      setTimeout(() => {
        dialog.close()
        window.location.reload()
      }, 1000)
    } catch (error) {
        
      isLoading = false
      toast.error('Falha ao editar permissões')
    }
  }
</script>

<button class="btn btn-primary" onclick={() => dialog.showModal()}>
  {permissions.role}
</button>

<dialog bind:this={dialog} id="my_modal_2" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <h3 class="text-lg font-bold">Edite as permissões</h3>
    {#if isLoading}
      <div class="my-10 flex items-center justify-center">
        <Loading />
      </div>
    {:else}
      <label class="form-control my-3 w-full">
        <select class="select select-bordered" bind:value={selectedRole}>
          <option disabled selected>Escolha o cargos desse usuario</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
          <option value="customer">Cliente</option>
        </select>
        {#if permissions.redirect}
          <select class="select select-bordered">

          </select>
        {/if}
      </label>
    {/if}
    <div class="flex justify-end">
      <button
        class="btn btn-primary"
        disabled={isLoading}
        onclick={handleUpdateUserPermission}
      >
        Salvar permissões
      </button>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
