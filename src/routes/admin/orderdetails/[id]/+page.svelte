<script lang="ts">
  import PaymentCashier from '$lib/components/PaymentCashier.svelte'
import type { PageData } from './$types'
import {getImagePath} from '$utils/image'

  export let data: PageData

  let order_details = data.order_details

  let isOpenModal: HTMLDialogElement | null = null
</script>

{#if order_details}
  <section
    class="container mx-auto flex flex-col-reverse gap-5 py-8 antialiased md:py-16 lg:flex-row"
  >
    <div class=" px-4 {order_details.address ? 'lg:w-2/3' : 'w-full'}  2xl:px-0">
      <h2 class="text-xl font-semibold text-opacity-90 sm:text-2xl">
        Resumo do pedido
      </h2>

      <div class="mt-6 sm:mt-8">
        <div class="relative w-full overflow-x-auto border-b border-base-200">
          <table
            class="w-full text-left font-medium text-opacity-90 md:table-fixed"
          >
            <tbody class="divide-y divide-base-200">
              {#each order_details.items as item}
                <tr>
                  <td class="whitespace-nowrap py-4 md:w-[384px]">
                    <div class="flex items-center gap-4">
                      <div
                        class="flex aspect-square h-14 w-14 shrink-0 items-center"
                      >
                        <img
                          class="h-auto max-h-full w-full rounded-md"
                          src={getImagePath(item.product.image)}
                          alt="product"
                        />
                      </div>
                      <h1>{item.product.name}</h1>
                    </div>
                  </td>

                  <td class="p-4 text-base font-normal text-opacity-90 text-right">
                    {item.quantity}x R${(item.price/100).toFixed(2)}
                  </td>

                  <td
                    class="p-4 text-right text-base font-bold text-opacity-90"
                  >
                    R${(item.price*item.quantity/100).toFixed(2)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="mt-4 space-y-6">
          <dl class="flex items-center justify-between gap-4 pt-2">
            <dt class="text-lg font-bold text-opacity-90">Total:</dt>
            <dd class="text-xl font-bold text-opacity-90">
              R${(order_details.total / 100).toFixed(2)}
            </dd>
          </dl>

          <div class="gap-4 sm:flex sm:items-center">
            <button type="button" class="btn btn-primary w-full" on:click={()=> isOpenModal?.showModal()}>
              Pagamento
            </button>
          </div>
        </div>
      </div>
    </div>

    {#if order_details.customer}
      <div class="px-4 lg:w-1/3 2xl:px-0">
        <h2 class="text-2xl font-semibold text-opacity-90">
          Detalhes do Cliente
        </h2>
        <div class="mt-6 space-y-6 border-t border-base-200 py-6">
          <dl class="space-y-4">
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Nome:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.name}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Email:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.email}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-lg font-semibold text-opacity-90">Telefone:</dt>
              <dd class="text-base font-normal text-opacity-50">
                {order_details.customer.phone ?? 'Telefone não registrado!'}
              </dd>
            </div>
          </dl>

          {#if order_details.address}
            <div class="mt-6 space-y-4 border-t border-base-200 py-6">
              <h4 class="text-lg font-semibold text-opacity-90">
                Endereço do Cliente
              </h4>
              <dl>
                <dd class="mt-1 text-base font-normal text-opacity-50">
                  {order_details.address.street}, {order_details.address.number}
                  {order_details.address.complement}, {order_details.address.neighborhood}, {order_details
                    .address.city} - {order_details.address.state}, CEP: {order_details.address.cep}
                </dd>
              </dl>
              <!-- <div class="flex justify-end">
                <button class="btn btn-link">Mudar endereço</button>
              </div> -->
              <!--TODO: mudar endereco and if !endereco colocar pra vincular-->
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </section>
{/if}

<!-- <pre>
    {JSON.stringify(order_details, null, 2)}
</pre> -->

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-2xl">
    <PaymentCashier total_pedido={order_details?.total}/>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>