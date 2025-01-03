<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { Axis, BarChart, Bars, Chart, Labels, PieChart, Rule, Svg } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import { scaleBand } from 'd3-scale'
  import SvChart from '../SvChart.svelte'
  
  let { data }: { data: PageData } = $props();
  let dataCard = 
  [
    {
      "NomeMotoboy": 'Gustavo',
      "valueRelatorio": 68,
      "baseline": 90
    },
    {
      "NomeMotoboy": 'Vitor',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Pedro',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Jose',
      "valueRelatorio": 38,
      "baseline": 45
    },
    {
      "NomeMotoboy": 'Joadsfdse',
      "valueRelatorio": 38,
      "baseline": 45
    },
  ]

  let larguraGrafico = "height:" + dataCard.length * 30+"px;";
</script>

<NavDashboard 
cardUm={{
  titleCard : "Total de entregas", 
  textCard : data.totalDelivered.toString(),
  subTitle : ""
}}
cardDois={{
  titleCard : "Total taxas de entrega", 
  textCard : "",
  subTitle : ""
}}
cardTres={{
  titleCard : "Pedidos cancelados", 
  textCard : "",
  subTitle : ""
}}
cardQuatro={{
  titleCard : "Melhor produto", 
  textCard : "",
  subTitle : ""
}}
/>

<h1>Página de vendas</h1>

<div class="flex flex-col lg:flex-row gap-3">
  <Card.Root class="w-full lg:w-9/12 ">
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <!-- <Card.Content class="flex flex-col md:flex-row gap-4"> -->
    <Card.Content class="flex flex-wrap">
      <div class="w-full pr-3">
        <SvChart 
        config={{
          type : "bar", 
          data : {
            labels : dataCard.map((d) => d.NomeMotoboy),
            datasets:
            [
              {
                label : "Total",
                data : dataCard.map((d) => d.valueRelatorio),
                backgroundColor : 
                [
                  'rgba(255, 217, 0)'
                ],
                barThickness : 30,
              }
            ]
          },
          options: {
            indexAxis: 'y',
          }
        }}
        height={dataCard.length * 60}
        title={"Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega) - vai ter que ser um gráfico em pé, mostrando todos os motoboys e a altura vai variar conforme a quantidade de motoboys naquela distribuidora"}
        />
        <!-- Axis = Heixo -->
        <!-- placement = localização -->
        <!-- Scalable Vector Graphics -->              
    </div>
  </Card.Content>
</Card.Root>
<Card.Root class="w-full lg:w-3/12">
  <Card.Header>
    <Card.Title>Ultimas entregas</Card.Title>
  </Card.Header>
  <Card.Content>
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