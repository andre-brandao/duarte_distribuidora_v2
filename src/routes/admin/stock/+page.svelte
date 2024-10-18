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
  // import ModalSupplierComplete from './ModalSupplierComplete.svelte'

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
    const url = new URL(Filters)
    if (value !== '') url.searchParams.set(name, value)
    else url.searchParams.delete(name)

    goto(url, { keepFocus: true })
  }

  function Filters_clear(...params: string[]) {
    const url = new URL(Filters)
    params.forEach(p => url.searchParams.delete(p))
    goto(url, { keepFocus: true })
  }

  function Filters_isFiltered(...params: string[]) {
    return params.length > 0 && params.some(p => Filters.searchParams.has(p))
  }

  function Filters_update_many(params: Record<string, string>) {
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

  function add() {
    modal.open(FormModal<RouterInputs['stock']['insertSKU']>, {
      title: 'Create',
      fields: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'codigo',
          name: 'sku',
          type: 'text',
          required: true,
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).stock.insertSKU.mutate(toSave)
          console.log(resp)

          if (resp) {
            toast.success('SKU Created')
          }
          window.location.reload()
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
      },
    })
  }

  //TODO: FIX não aparece todos SKU, ao filtrar sim

  //   async function handleUpdate(
  //     newItem: any,
  //     key: string,
  //     idx: number,
  //     currentItem: any,
  //   ) {
  //     try {
  //       await trpc($page).stock.updateSku.mutate({
  //         id: newItem.id,
  //         supplier: { [key]: newItem[key] },
  //       })
  //       toast.success('Atualizado com sucesso!')
  //     } catch (error: any) {
  //       toast.error('Erro ao atualizar')
  //       console.error(error)
  //       $tableRows[idx] = currentItem
  //     }
  //     $tableRows = $tableRows
  //   }
</script>

<section class="container mx-auto px-4">
  <div class="mt-2 flex items-center justify-between">
    <h1 class="text-2xl font-semibold">Estoque:</h1>
    <div>
      <button class="btn btn-primary" onclick={add}>Criar SKU</button>
      <a href="/admin/stock/entrada" class="btn btn-secondary">
        Entrada de estoque
      </a>
    </div>
  </div>
</section>
<SSRTable
  count={readable(data.count)}
  {tableRows}
  columns={table => [
    table.column({
      header: 'SKU',
      accessor: 'sku',
    }),
    table.column({
      header: 'Name',
      accessor: 'name',

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
      header: 'Quantidade',
      accessor: 'quantity',
    }),
    table.column({
      header: 'Criado em',
      accessor: 'created_at',
    }),
    table.column({
      header: 'Detalhes',
      accessor: item => item,
      cell: ({ value }) =>
        createRender(GoToDetails, {
          value: `/admin/stock/${value.sku}`,
          text: 'Ir para detalhes',
        }),
    }),

    // table.column({
    //   header: 'Criado em',
    //   accessor: 'created_at',

    // }),
  ]}
/>
