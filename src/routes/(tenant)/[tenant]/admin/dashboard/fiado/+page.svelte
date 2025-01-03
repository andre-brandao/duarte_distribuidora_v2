<script lang="ts">
  import NavDashboard from '$lib/components/dashboard/admin/NavDashboard.svelte'
  import * as Card from '$lib/components/ui/card'
  import { BarChart, PieChart } from 'layerchart'
  import type { PageData } from './$types';
  import { RecentSales } from '$lib/components/dashboard/admin'
  import SvChart from '../SvChart.svelte'

  let { data }: { data: PageData } = $props();
  let DebtorsNumber = 4;
</script>

<h1>Fiados</h1>

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
          type: "bar",
          data:{
            labels : ["Pimba master 2018", "Cabeça de lampada", "Bazinga", "Coca cola"],
            datasets : [
              {
                label: "Divida",
                barThickness : 30,
                data: [30, 20, 50, 50],
                backgroundColor: [
                  'rgba(0, 128, 0)'
                ],
                
              },
              {
                label: "Total pago",
                barThickness : 30,
                data: [30, 44, 30, 15],
                backgroundColor: [
                  'rgba(255, 0, 0)'
                ],
                
              }
            ]
          },
          options:{
            
            // layout: {
            //   padding: 20
            // },
            scales:{
              x: {
                stacked : true
              },
              y: {
                stacked : true
              }
            },
            indexAxis : "y"
          }
        }}
        height={DebtorsNumber * 60}
        title={"Relatorio recebimento atingido"}
        />
      </div>
      <div class="w-full">
        <SvChart 
        config={{
          type: "bar",
          data:{
            labels : ["Ze da esquina", "Viciado em cachaça", "André"],
            datasets:[
              {
                label: "Dívidas",
                data: [10,80,110],
                backgroundColor:
                [
                  "rgb(255,255,0)"
                ],
                barThickness : 50,
              }
            ]
          }
        }}
        height={180}
        title={"Maiores dívidas (Vai usar a msm query de clientes PJ com dívida)"}
        />
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full lg:w-3/12">
    <Card.Header>
      <Card.Title>Clientes PJ com dívida</Card.Title>
    </Card.Header>
    <Card.Content>
      <!-- TODO: Mudar o recent sales -->
      <RecentSales textRecentSale={[
        {
          title : "Drinking Partner",
          value : "R$ 200,00"
        }
      ]}/>
    </Card.Content>
  </Card.Root>
</div>