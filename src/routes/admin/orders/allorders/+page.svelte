<script lang="ts">
  import Datatable from '$lib/components/table/Datatable.svelte'
  import type { PageData } from './$types'
  import type { RouterOutputs } from '$trpc/router'
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
  import { page } from '$app/stores'
  import { trpc } from '$trpc/client'
  import { goto } from '$app/navigation'
  import CurrencyFormat from '$lib/components/table/CurrencyFormat.svelte'

  const defaultColumns: ColumnDef<
    RouterOutputs['customer']['getPaginatedOrders']['rows']
  >[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      footer: info => info.column.id,
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
    {
      header: 'Cliente',
      accessorKey: 'name',
    },
    {
      header: 'Caixa',
      accessorKey: 'cashier',
    },
    {
      header: 'Observações',
      accessorKey: 'observation',
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: info =>
        renderComponent(CurrencyFormat, {
          value: info.getValue(),
        }),
    },
    {
      id: 'actions',
      header: () => 'Actions',
      cell: info =>
        renderComponent(RowActions, {
          actions: [
            {
              name: 'Ver detalhes',
              fn: () => {
                goto(`/admin/orders/${info.row.original[0].id}`)
              },
            },
          ],
        }),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).customer.getPaginatedOrders.query(s)
    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }
</script>

<!-- {JSON.stringify(orders, null, 2)} -->

<Datatable columns={defaultColumns} {load} />
