<script lang="ts">
  import { Chart } from 'chart.js/auto';
  import { type ChartConfiguration } from 'chart.js';

  interface Props{
    config : ChartConfiguration,
    width? : number,
    height? : number,
    id? : string,
    title : string,
  }

  let {config, width = 400, height = 300, id = "", title} : Props = $props();

  function chart(node : HTMLCanvasElement){
    // Se não rodar, ver se importando o Chart de alguma dessas formas funciona
    // const { Chart } = await import('chart.js/auto');
    // import('chart.js')
    // .then(({Chart}) => {
    // })
    const ctx = node.getContext("2d");
    if(!ctx) return
    const c = new Chart(ctx, config)
  }
</script>

<h2 class="text-center text-xl font-semibold">
  {title}
</h2>
<canvas use:chart {id} {width} {height}></canvas>
