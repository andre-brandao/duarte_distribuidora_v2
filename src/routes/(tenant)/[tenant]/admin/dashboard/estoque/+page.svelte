<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'

  let { data }: { data: PageData } = $props();
</script>

<NavDashboard 
  cardUm={{
    titleCard : "Total", 
    textCard : "",
    subTitle : ""
  }}
  cardDois={{
    titleCard : "Entradas - Saídas", 
    textCard : "",
    subTitle : ""
  }}
  cardTres={{
    titleCard : "Maior produto", 
    textCard : "",
    subTitle : ""
  }}
  cardQuatro={{
    titleCard : "Maior categoria", 
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
      <div class="w-1/2 pr-3">
        <SvChart 
        config={{
          type : "bar",
          data : {
            labels: ["Coca-cola 2 litros", "Budweiser"],
            datasets : [
              {
                label: "Total",
                data: [50, 45],
                barThickness: 50  
              }
            ]
          } 
        }}
        height={300}
        title={"Estoque abaixo do mínimo"}
        />
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Produtos com menor quantidade de estoque</Card.Title>
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