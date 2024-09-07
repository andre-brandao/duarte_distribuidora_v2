<script lang="ts">
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import Card1 from '$lib/components/cards/Card1.svelte'

  import { getImagePath } from '$utils/image'

  export let data: PageData
  const { products } = data

  let filteredProducts = products

  $:console.log(filteredProducts)
</script>

<Cardapio
  data={filteredProducts}
  onFilterChange={value => {
    filteredProducts = products.map(product => ({
      ...product,
      products: product.products.filter(productInner => {
        let nome = productInner.name.toLowerCase()
        return nome.includes(value.toLowerCase())
      })
    })).filter(product => product.products.length > 0)
  }}
>
  {#snippet card(c)}
    <a href="/products/{c.id}">
      <Card1
        nome={c.name}
        descricao={c.description}
        image={getImagePath(c.image)}
        preco={'TODO'}
      />
    </a>
  {/snippet}
</Cardapio>
