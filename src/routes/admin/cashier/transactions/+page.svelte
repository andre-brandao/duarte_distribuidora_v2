<!-- <script lang="ts">
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { trpc } from '$trpc/client'

  import type { RouterOutputs } from '$trpc/router'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'

  const defaultColumns: ColumnDef<
    RouterOutputs['stock']['getPaginatedTransacaoCaixa']['rows']
  >[] = [
    {
      header: 'ID',
      accessorKey: 'cashier_transaction.id',
      footer: info => info.column.id,
    },
    {
      header: 'Criado em',
      accessorKey: 'cashier_transaction.created_at',
    },
    {
      header: 'caixa',
      accessorKey: 'cashier_name',
    },
    {
      header: 'Tipo',
      accessorKey: 'cashier_transaction.type',
    },
    {
      header: 'Valor',
      accessorKey: 'cashier_transaction.amount',
    },
    {
      header: 'Observacão',
      accessorKey: 'cashier_transaction.observation',
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).stock.getPaginatedTransacaoCaixa.query(s)
    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }
</script>


<div class="container mx-auto my-3 overflow-x-auto p-2">
  <Datatable columns={defaultColumns} {load} />
</div> -->
