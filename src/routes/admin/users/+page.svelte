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
  import EditPermissions from './EditPermissions.svelte'
  import EditRole from './EditRole.svelte'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'

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

  async function handleUpdate(
    newItem: any,
    key: string,
    idx: number,
    currentItem: any,
  ) {
    try {
      await trpc($page).auth.updateUser.mutate({
        userId: newItem.id,
        user: { [key]: newItem[key] },
      })
      toast.success('Atualizado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao atualizar')
      console.error(error)
      $tableRows[idx] = currentItem
    }
    $tableRows = $tableRows
  }
</script>

<SSRTable
  count={readable(data.count)}
  {tableRows}
  columns={table => [
    // table.display({
    //   id: 'selected',
    //   header: '',
    //   cell: ({ row, column }, { pluginStates }) => {
    //     const { isSomeSubRowsSelected, isSelected } =
    //       pluginStates.select.getRowState(row)
    //     return createRender(SelectIndicator, {
    //       isSelected,
    //       isSomeSubRowsSelected,
    //     })
    //   },
    // }),
    table.column({
      header: 'ID',
      accessor: 'id',
    }),
    table.column({
      header: 'Name',
      accessor: 'username',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: async (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            // In this case, the dataId of each item is its index in $tableRows.
            // You can also handle any server-synchronization necessary here.
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows
            // Handle any server-synchronization.
            handleUpdate(newItem, key, idx, currentItem)
            
          },
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
                  username: value,
                  page: '1',
                })
              },
            }),
        },
      },
    }),
    table.column({
      header: 'Email',
      accessor: 'email',
      cell: ({ column, row, value }) =>
        createRender(EditableCell, {
          row,
          column,
          value,
          onUpdateValue: (
            rowDataId: string,
            columnId: string,
            newValue: unknown,
          ) => {
            console.log(rowDataId, columnId, newValue)
            // In this case, the dataId of each item is its index in $tableRows.
            // You can also handle any server-synchronization necessary here.
            const idx = parseInt(rowDataId)
            const currentItem = $tableRows[idx]
            const key = columnId // Cast as `keyof YourDataItem`
            const newItem = { ...currentItem, [key]: newValue }
            console.log(newItem)
            $tableRows[idx] = newItem
            $tableRows = $tableRows
            // Handle any server-synchronization.
            handleUpdate(newItem, key, idx, currentItem)
          },
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
              change: value =>
                Filters_update_many({
                  email: value,
                  page: `1`,
                }),
            }),
        },
      },
    }),
    // table.column({
    //   header: 'Verified',
    //   accessor: 'emailVerified',
    //   // cell: EditableCell
    //   cell: ({ column, row, value }) =>
    //     createRender(EditableCell, {
    //       row,
    //       column,
    //       value,
    //       onUpdateValue: (
    //         rowDataId: string,
    //         columnId: string,
    //         newValue: unknown,
    //       ) => {
    //         newValue = newValue === 'true'
    //         console.log(rowDataId, columnId, newValue)
    //         // In this case, the dataId of each item is its index in $tableRows.
    //         // You can also handle any server-synchronization necessary here.
    //         const idx = parseInt(rowDataId)
    //         const currentItem = $tableRows[idx]
    //         const key = columnId // Cast as `keyof YourDataItem`
    //         const newItem = { ...currentItem, [key]: newValue }
    //         console.log(newItem)
    //         $tableRows[idx] = newItem
    //         $tableRows = $tableRows
    //         // Handle any server-synchronization.
    //       },
    //     }),
    // }),
    table.column({
      header: 'Permissões',
      accessor: item => item,
      cell: ({ row, column, value, props }) =>
        createRender(EditPermissions, {
          userId: row.id,
          userName: value.username,
          userPermissions: value.meta.permissions ?? [],
        }),
    }),

    table.column({
      header: 'Cargo',
      accessor: item => item,

      cell: ({ row, column, value, props }) =>
        createRender(EditRole, {
          userId: value.id,
          userRole: value.role,
          userName: value.username,
        }),
    }),
  ]}
/>
