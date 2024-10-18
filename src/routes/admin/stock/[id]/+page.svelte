<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  const { estoque } = data

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

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
    EditRowCurrency,
  } from '$lib/components/table'
  import type { RouterOutputs, RouterInputs } from '$trpc/router'

  import type { metaEntrada, metaSaida, MetaUnion } from '$db/schema'
  import { icons } from '$lib/utils'
  import { scaleBand, scaleTime } from 'd3-scale'
  import {
    Chart,
    Svg,
    Axis,
    Bars,
    Area,
    Tooltip,
    TooltipItem,
  } from 'layerchart'
  import { toast } from 'svelte-sonner'

  function isMetaEntrada(meta: MetaUnion): meta is metaEntrada {
    return meta.type === 'entrada'
  }

  function isMetaSaida(meta: MetaUnion): meta is metaSaida {
    return meta.type === 'saida'
  }

  type Transaction = RouterOutputs['stock']['paginatedTransactions']['rows'][0]

  let transactions: Transaction[] = []

  $: chartData = transactions.map(t => ({
    ...t,
    created_at: new Date(t.updated_at ?? ''),
  }))

  $: console.log(chartData)

  const defaultColumns: ColumnDef<Transaction>[] = [
    {
      header: 'Date',
      accessorFn: v => v.updated_at ?? '',
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: 'Quantidade',
      accessorKey: 'quantity',
    },
    // {
    //   header: 'ID Pedido',

    //   accessorFn: r => JSON.stringify(r.meta_data),
    // },
    {
      header: 'Tipo',
      accessorKey: 'type',
    },
    {
      header: 'Custo',
      accessorKey: 'cost_price',
      cell: info =>
        renderComponent(EditRowCurrency<Transaction>, {
          id: info.row.original.id,
          colID: 'cost_price',
          editT: 'number',
          value: info.getValue(),
        }),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).stock.paginatedTransactions.query({
      sku: estoque.sku,
      table_state: s,
    })

    transactions = resp.rows

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }

  async function handleDeleteStockItem(sku:string){
    try {
      await trpc($page).stock.deleteItemStock.mutate(sku)
      toast.success('Deletado com sucesso!')
      window.location.href = "./"
    } catch (error) {
      toast.error('Ocorreu um erro ao deletar!')
    }
  }
</script>

<div class="">
  <div class="container mx-auto flex flex-col gap-5">
    <div class="flex items-center justify-center gap-3">
      <div class="stats bg-base-200 shadow">
        <div class="stat flex items-center">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-8 w-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <!-- <div class="stat-title">{stock.distribuidora.name}</div> -->
          <div class="stat-value">{estoque.name}</div>
          <!-- <div class="stat-desc">Jan 1st - Feb 1st</div> -->
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            {@html icons.box()}
          </div>
          <div class="stat-title">Quantidade em Estoque</div>
          <div class="stat-value flex justify-center">{estoque.quantity}</div>
          <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
        </div>
      </div>
      <button class="btn btn-circle btn-error w-20 h-20"  on:click={()=>{
        if(confirm("Tem certeza que deseja deletar?") === true){
          handleDeleteStockItem(estoque.sku)
        } else {
          toast.info("Cancelado")
        }
        }}>
        {@html icons.trash()}
      </button>
    </div>
    <div class="mb-5 flex gap-2">
      <div
        class=" h-[70vh] w-full max-w-[50%] overflow-x-auto rounded-box border border-base-300"
      >
        <Datatable columns={defaultColumns} {load} />
      </div>

      <div class="w-full max-w-[50%] rounded-box border p-4">
        <div class="h-[300px] rounded p-4">
          <Chart
            data={chartData}
            x="created_at"
            xScale={scaleBand().padding(0.2)}
            y={['total_log', 'quantity']}
            yDomain={[0, null]}
            yNice={4}
            padding={{ left: 16, bottom: 24 }}
            tooltip={{ mode: 'band' }}
            debug
          >
            <Svg>
              <Axis placement="left" grid rule />
              <Axis
                placement="bottom"
                format={d => d.toLocaleString()}
                rule
                tickLabelProps={{
                  rotate: 290,
                  textAnchor: 'end',
                  class: ' font-semibold',
                }}
              />
              <Bars y="quantity" radius={2} class="fill-primary" />
              <Area
                y1="total_log"
                class="fill-secondary/20"
                line={{ class: 'stroke-secondary' }}
              />
              <!-- <Highlight area /> -->
            </Svg>

            <Tooltip header={data => data.created_at} let:data>
              <TooltipItem label="Quantidade Transacao" value={data.quantity} />
              <TooltipItem label="Total em estoque no momento" value={data.total_log} />
            </Tooltip>
          </Chart>
        </div>
      </div>
    </div>
  </div>
</div>
