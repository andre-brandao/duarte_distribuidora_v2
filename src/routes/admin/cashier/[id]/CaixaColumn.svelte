<script lang="ts">
  import { getCartContext } from '$lib/stores/cart'
  import { icons } from '$lib/utils'

  const cart = getCartContext()

  $:total = Object.values($cart).reduce((acc,item) => {
    return acc + item.item[item.is_retail ? 'retail_price': 'wholesale_price'] *item.quantity
  },0)
</script>

<ul class="mb-4 max-h-[50vh] overflow-scroll text-center text-lg">
  {#each Object.values($cart) as item}
    <div class="flex items-center justify-between">
      <div class="flex">
        <label class="swap m-1 rounded-md border p-1">
          <input type="checkbox" bind:checked={item.is_retail} />
          <div class="swap-on">Varejo</div>
          <div class="swap-off">Atacado</div>
        </label>
        <li class="py-2 font-bold">
          ({item.quantity}x)
          <span class="text-sm text-secondary">
            R${(
              item.item[item.is_retail ? 'retail_price' : 'wholesale_price'] /
              100
            ).toFixed(2)}
          </span>
          {item.item.name} - 
          <span class="text-success">
            R${(
              (item.quantity *
                item.item[
                  item.is_retail ? 'retail_price' : 'wholesale_price'
                ]) /
              100
            ).toFixed(2)}
          </span>
        </li>
      </div>
      <button
        class="btn btn-circle m-1"
        on:click={e => cart.removeItem(item.item.id)}
      >
        {@html icons.x({ stroke: 'red' })}
      </button>
    </div>
    <hr />
  {/each}
</ul>

<h2 class="mx-10 flex justify-center text-3xl font-bold">
  Preço total:&nbsp;
  <span class="text-success">R${(total/100).toFixed(2)}</span>
</h2>
