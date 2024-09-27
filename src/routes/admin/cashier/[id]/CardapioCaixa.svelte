<script lang="ts">
  import { getImagePath } from '$lib/utils/image'
  import { getCartContext } from '$lib/stores/cart'
  import { icons } from '$lib/utils/icons'
  import Cardapio from '$lib/components/Cardapio.svelte'

  export let products
  export let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'

  let filteredResults = products;

  //TODO:Fix types

  const cart = getCartContext()

</script>

<Cardapio
  data={filteredResults}
  onFilterChange={value => {
    filteredResults = products
      .map((product) => {
        const filteredSubProducts = product.products.map(subProduct => {
          const filteredItems = subProduct.items.filter(item =>
            item.name.toLowerCase().includes(value),
          )
          return { ...subProduct, items: filteredItems }
        })

        return { ...product, products: filteredSubProducts }
      })
      .filter((product) =>
        product.products.some(subProduct => subProduct.items.length > 0),
      )
  }}
>
  {#snippet card(p)}
    <div class="card w-full p-1">
      <div class="grid grid-cols-1 gap-3">
        {#each p.items as item}
          {@const cartItem = $cart[item.id]}

          <hr />
          <div class="flex w-full py-2">
            <div class=" hidden flex-none md:block md:w-auto">
              <img
                alt="imagem"
                src={getImagePath(item.image)}
                class="h-16 w-16 rounded-lg object-cover md:h-20 md:w-20"
              />
            </div>
            <div class="ml-4 w-full">
              <h2 class="font-bold md:text-xl">{item.name}</h2>
              <h3 class="md:text-md text-secondary">{p.description}</h3>
            </div>
            <div class="w-full text-right">
              <span class="block pb-3 text-xl font-bold">
                R${(item[tipo_preco] / 100).toFixed(2)}
              </span>
              <div class="flex items-center justify-end gap-3 text-center">
                {#if cartItem?.quantity >= 1}
                  <button
                    class="btn btn-primary hidden md:block"
                    on:click={() => {
                      if (cartItem.quantity <= 1) {
                        cart.removeItem(item.id)
                      } else {
                        cart.addItem({
                          item: item,
                          quantity: -1,
                          is_retail:
                            tipo_preco == 'retail_price' ? true : false,
                        })
                      }
                    }}
                  >
                    {@html icons.minus()}
                  </button>
                {/if}
                <input
                  min="1"
                  class="max-w-16 bg-base-100 text-right text-xl font-bold focus:border-yellow-500 md:min-w-10 md:max-w-28"
                  value={$cart[item.id]?.quantity ?? 0}
                  on:change={e => {
                    const quant_temp = (e.target as HTMLInputElement)?.value
                    cart.setItem({
                      item: item,
                      quantity: Number(quant_temp),
                      is_retail: tipo_preco == 'retail_price' ? true : false,
                    })
                  }}
                />
                <button
                  on:click={() =>
                    cart.addItem({
                      item: item,
                      quantity: 1,
                      is_retail: tipo_preco == 'retail_price' ? true : false,
                    })}
                  class="btn btn-primary"
                >
                  {@html icons.plus()}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/snippet}
</Cardapio>
