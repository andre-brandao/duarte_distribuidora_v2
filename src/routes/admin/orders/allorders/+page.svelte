<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  import {
    createTable,
    Subscribe,
    Render,
    createRender,
    type DataLabel,
    type Column,
    type Table,
  } from '@andre-brandao/svelte-headless-table'
  import {
    addSortBy,
    addColumnOrder,
    addColumnFilters,
    addSelectedRows,
    addResizedColumns,
    addGridLayout,
    addPagination,
  } from '@andre-brandao/svelte-headless-table/plugins'
  import {
    readable,
    writable,
    type Writable,
    type Readable,
  } from 'svelte/store'
  import TextFilter from '$lib/components/newTable/filters/TextFilter.svelte'
  import { page } from '$app/stores'

  import SelectIndicator from '$lib/components/newTable/edit/SelectIndicator.svelte'
  import EditableCell from '$lib/components/newTable/edit/EditableCell.svelte'
  import { goto } from '$app/navigation'
  // import type { SelectUser } from '$drizzle/schema'
  import { onDestroy, onMount } from 'svelte'
  import {
    SSRTable,
    SSRFilter,
    type SSRTableProps,
  } from '$lib/components/newTable/ssr/index.svelte'
  import { debounce } from '$lib/utils'

  import EditableCurrency from '$lib/components/newTable/edit/EditableCurrency.svelte'
  import GoToDetails from '$lib/components/newTable/goToDetails.svelte'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import { modal, FormModal } from '$lib/components/modal'
  import type { RouterInputs } from '$trpc/router'
  import { invalidate } from '$app/navigation'
  import ShowNull from '$lib/components/newTable/ShowNull.svelte'
  import Currency from '$lib/components/newTable/Currency.svelte'
  import DateFilter from './DateFilter.svelte'
  import Date from '$lib/components/newTable/Date.svelte'

  const usernameFilter = debounce(SSRFilter.update_many, 500)
  const emailFilter = debounce(SSRFilter.update_many, 500)
  console.log(data)

  const tableRows = writable(data.rows ?? [])

  $effect(() => {
    console.log('data.rows', data.rows)

    tableRows.set(data.rows)
  })

  let Filters = $derived($page.url)

  function Filters_get(name: string) {
    return Filters.searchParams.get(name)
  }

  function Filters_update(name: string, value: string) {
    if(typeof window=== 'undefined'){
      return
    }
    const url = new URL(Filters)
    if (value !== '') url.searchParams.set(name, value)
    else url.searchParams.delete(name)

    goto(url, { keepFocus: true })
  }

  function Filters_clear(...params: string[]) {
    if(typeof window=== 'undefined'){
      return
    }
    const url = new URL(Filters)
    params.forEach(p => url.searchParams.delete(p))
    goto(url, { keepFocus: true })
  }

  function Filters_isFiltered(...params: string[]) {
    return params.length > 0 && params.some(p => Filters.searchParams.has(p))
  }

  function Filters_update_many(params: Record<string, string>) {
    if(typeof window=== 'undefined'){
      return
    }
    const url = new URL(Filters)
    Object.entries(params).forEach(([name, value]) => {
      if (!value) {
        url.searchParams.delete(name)
      }
      if (value !== '') url.searchParams.set(name, value)
      else url.searchParams.delete(name)
    })

    const searchParams = url.pathname + url.search
    goto(searchParams, { keepFocus: true })
  }
</script>
<SSRTable
  count={readable(data.count)}
  {tableRows}
  totalSum={data.totalSum}
  columns={table => [
    table.column({
      header: 'ID',
      accessor: 'id',
    }),
    table.column({
      header: 'Cliente',
      accessor: 'name',
      cell: ({ column, row, value }) =>
        createRender(ShowNull, {
          value,
        }),
      plugins: {
        sort: {
          invert: false,
          // disable: true,
        },
        filter: {
          initialFilterValue: '',
          render: ({ filterValue, values, preFilteredValues }) =>
            createRender(TextFilter, {
              filterValue,
              values,
              preFilteredValues,
              change: value => {
                console.log('change username', value)

                Filters_update_many({
                  name: value,
                  page: '1',
                })
              },
            }),
        },
      },
    }),
    table.column({
      header: 'Tipo',
      accessor: 'type',
    }),
    table.column({
      header: 'Caixa',
      accessor: 'cashier',
      cell: ({ column, row, value }) =>
        createRender(ShowNull, {
          value,
        }),
    }),
    table.column({
      header: 'Observações',
      accessor: 'observation',
    }),
    table.column({
      header: 'Data',
      accessor: 'created_at',
      cell: ({ column, row, value }) =>
        createRender(Date, {
          date:value,
        }),
      plugins: {
        sort: {
          invert: false,
          // disable: true,
        },
        filter: {
          initialFilterValue: '',
          render: ({ filterValue, values, preFilteredValues }) =>
            createRender(DateFilter, {
              onchange: (start, end) => {
                console.log('onchange called with:', start, end)
                Filters_update_many({ start, end, page: '1' })
              },
            }),
        },
      },
    }),
    table.column({
      header: 'Total',
      accessor: 'total',
      cell: ({ column, row, value }) =>
        createRender(Currency, {
          value,
        }),
    }),
    table.column({
      header: 'Ver detalhes do pedido',
      accessor: item => item,
      cell: ({ value }) =>
        createRender(GoToDetails, {
          value: `/admin/orders/${value.id}`,
          text: 'Ir para detalhes',
        }),
    }),
  ]}
/>
