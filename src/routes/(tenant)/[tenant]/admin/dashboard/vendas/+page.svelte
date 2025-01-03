<script lang="ts">
  import { Axis, BarChart, Bars, Chart, Pie, PieChart, Svg, Tooltip } from 'layerchart'
  import type { PageData } from './$types';
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Tabs from '$lib/components/ui/tabs/index';
  import * as Card from '$lib/components/ui/card/index'
  import { Overview, RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import { format } from 'date-fns'
  import { icons } from '$lib/utils/icons'
  import { page } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'; 
  import SvChart from '../SvChart.svelte'
  import {type ChartConfiguration } from 'chart.js'

  let { data }: { data: PageData } = $props();

  const { 
    revenueByMonth , topRevenueProducts, topSellingCategories, topCustomerOrders, 
    topOrderedProducts, AvgOrderValue, quantOrders, topCustomers, financialSummary,
    mostPopularPaymentMethods
  } = data;

  let colorPaymentMethods = {
    pix: '#3CB371',
    credit_card: '#1E90FF',
    debit_card: '#87CEEB',
    dinheiro: '#006400'
  }

  const mostPopularPaymentMethodsWithColor = $derived.by(
    () => mostPopularPaymentMethods.map((method) => (
    {
      ...method,
      color: method.payment_method in colorPaymentMethods ? colorPaymentMethods[method.payment_method] : 'gray'
    }
  )))

  let dadoComparar = [
    {
      product_name: "Brahma",
      total_revenue: 65,
      total_revenue_compare: 44,
      total_quantity_ordered: 2,
      initialDate: "18/02/2024",
      endDate: "28/02/2024"
    },
    {
      product_name: "Skol",
      total_revenue: 80,
      total_revenue_compare: 75,
      total_quantity_ordered: 5,
      initialDate: "01/01/2024",
      endDate: "10/03/2024"
    },
    { 
      product_name: "Heineken",
      total_revenue: 120,
      total_revenue_compare: 95,
      total_quantity_ordered: 8,
      initialDate: "15/03/2024",
      endDate: "25/03/2024"
    },
    {
      product_name: "Budweiser",
      total_revenue: 100,
      total_revenue_compare: 85,
      total_quantity_ordered: 6,
      initialDate: "01/04/2024",
      endDate: "10/04/2024"
    },
    {
      product_name: "Corona",
      total_revenue: 70,
      total_revenue_compare: 100,
      total_quantity_ordered: 3,
      initialDate: "15/04/2024",
      endDate: "25/04/2024"
    },
    {
      product_name: "Stella",
      total_revenue: 100,
      total_revenue_compare: 100,
      total_quantity_ordered: 3,
      initialDate: "15/04/2024",
      endDate: "25/04/2024"
    }
  ];

  let dadoCompararProdutoMaisVendido = [
    {

    },
    {

    }
  ]

  let calculaAumento = (initial : number, end : number) => {
    let calcula = parseFloat((100 - (end * 100 / initial)).toFixed(2));
    let htmlText = calcula > 0 ? icons.arrows.down_line() : icons.arrows.up_line()
    return `${htmlText} ${Math.abs(calcula)}%`
    // icons.arrows()
  }
    
  let carregaGrafico = false;
  
</script>

<NavDashboard 
  cardUm = {{
    titleCard : "Total", 
    textCard : "R$ " + (revenueByMonth[0].total_revenue / 100).toFixed(2).toString(),
    subTitle : "",
  }}
  cardDois = {{
    titleCard : "Resumo",
    textCard : "R$ " + (financialSummary / 100).toFixed(2).toString(),
    subTitle : ""
  }}
  cardTres = {{
    titleCard : "Ticket Médio",
    textCard : "R$ " + (AvgOrderValue[0].average_order_value / 100).toFixed(2).toString(),
    subTitle : ""
  }}
  cardQuatro = {{
    titleCard : "Total pedidos",
    textCard : quantOrders[0].total_orders.toString(),
    subTitle : ""
  }}
/>

<h1>Página de vendas</h1>

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap">
        <div class="w-full">
          <SvChart 
          config={{
            type : 'bar',
            data: {
              labels : (dadoComparar.map((d) => d.product_name)),
              datasets: [
                {                  
                  label: "Receita",
                  data: dadoComparar.map((d) => d.total_revenue),
                  backgroundColor: [
                    'rgba(0, 85, 199)'
                  ],
                  borderColor: [
                    'rgb(255, 99, 132)',
                  ],
                  borderWidth: 0,
                  barThickness : 50
                }
              ]
            },
          }}
          height={220}
          title={"Principais produtos de receita"}
          
          />
        </div>
        <div class="w-full">
          <SvChart 
          config={{
            type: 'bar',
            data: {
              labels: (topOrderedProducts.map((p) => p.product_name)),
              datasets: [
                {
                  label: "Quantidade",
                  data: topOrderedProducts.map((p) => p.total_quantity_ordered),
                  backgroundColor: [
                    'rgba(255, 217, 0)'
                  ]
                }
                // Dataset de comparação vem aqui
              ]
            }
          }}
          height={200}
          title={"Produtos mais vendidos (Quantidade)"}
          />
        </div>
        <div class="w-1/2">
          <SvChart 
          config={{
            type : 'pie',
            data: {
              labels: mostPopularPaymentMethodsWithColor.map((p) => {return p.payment_method}),
              datasets: [
                {
                  label: "Total: ",
                  data: mostPopularPaymentMethodsWithColor.map((p) => p.usage_count)
                },
                // Coloca aqui o dataset de comparação
              ] 
            }
          }}
          title={"Metodos de pagamento"}
          />
        </div>
        <div class="w-1/2">
          
          <SvChart 
          config={{
            type : "bar",
            data: {
              labels : topCustomers.map((t) => t.customer_name),
              datasets: 
              [
                {
                  label: "Total de pedidos",
                  data: topCustomers.map((t) => t.pedidos) 
                }
              ]
            }
          }}
          title={"Clientes que mais pediram"}
          height={400}
          />
        </div>
      </div>
    </Card.Content> 
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Clientes ociosos</Card.Title>
      <Card.Description>Não compra a 2 semanas ou mais</Card.Description>
    </Card.Header>
    <Card.Content>
      <!-- TODO: Mudar o recent sales -->
      <RecentSales textRecentSale={[
        {
          title : "Receita",
          text : "teste",
          value : "R$ 200,00"
        }
      ]}/>
    </Card.Content>
  </Card.Root>
</div>

<pre>
  {JSON.stringify(data.teste, null, 2)}
  {#each dadoComparar as item}
    {JSON.stringify(item, null, 2)}
  {/each}
</pre>
