<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { modal, FormModal } from '$lib/components/modal'

  import SuperSelect from '$lib/components/input/Select.svelte'
  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'
  import type { RouterOutputs, RouterInputs } from '$trpc/router'
  import { goto } from '$app/navigation'
  import EditRowCurrency from '$lib/components/table/EditRowCurrency.svelte'
  import EditRole from './EditRole.svelte'
  import EditPermissions from './EditPermissions.svelte'

  type Users = RouterOutputs['auth']['paginatedUsers']['rows'][0]

  const defaultColumns: ColumnDef<Users>[] = [
    {
      header: 'ID',
      accessorKey: 'id',

      footer: info => info.column.id,
    },
    {
      header: 'Username',
      accessorKey: 'username',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    
    {
      header: () => 'Email Verified',
      accessorKey: 'emailVerified',
      
      footer: info => info.column.id,
    },
    {
      header: 'Cadastrou em',
      accessorFn: row => new Date(row.created_at ?? '').toLocaleString(),
    },
    {
      header: 'Permissões',
      cell: info =>
        renderComponent(EditPermissions, {
          userId: info.row.original.id,
          userName:info.row.original.username,
          userPermissions:info.row.original.meta.permissions ?? []
        }),
    },
    {
      header: 'Cargo',
      cell: info =>
        renderComponent(EditRole, {
          // permissions: info.row.original.permissions,
          userRole: info.row.original.role,
          userId: info.row.original.id,
          userName:info.row.original.username
        }),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).auth.paginatedUsers.query(s)

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }
</script>

<div class=" h-[70vh] overflow-x-auto p-4">
  <Datatable columns={defaultColumns} {load} />
</div>
