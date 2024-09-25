<script lang="ts">
  import PaymentCashier from '$lib/components/PaymentCashier.svelte'
  import type { PageData } from './$types'
  import { getImagePath } from '$utils/image'
  import CardPayments from '$lib/components/cards/CardPayments.svelte'
  import PaymentFiado from '$lib/components/PaymentFiado.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import type { SelectOrderPayment } from '$lib/server/db/schema'

  export let data: PageData

  let order_details = data.order_details

  let isOpenModal: HTMLDialogElement | null = null

  let troco = 0

  troco = order_details?.payments?.reduce(
    (acc, payment) => acc + (payment.troco ?? 0),
    0,
  ) ?? 0

  let amount_paid_order = (order_details?.amount_paid ?? 0) - troco

</script>

{#if order_details}
  <section
    class="container mx-auto flex flex-col-reverse gap-5 pb-3 pt-8 antialiased md:pt-16 lg:flex-row"
  >
    <div
      class=" px-4 {order_details.address ? 'lg:w-2/3' : 'w-full'}  2xl:px-0"
    >
      <h2 class="text-xl font-semibold text-opacity-90 sm:text-2xl">
        Detalhes do pedido
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

                  <td
                    class="p-4 text-right text-base font-normal text-opacity-90"
                  >
                    {item.quantity}x R${(item.price / 100).toFixed(2)}
                  </td>

                  <td
                    class="p-4 text-right text-base font-bold text-opacity-90"
                  >
                    R${((item.price * item.quantity) / 100).toFixed(2)}
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
          <hr />
          <div>
            <h1 class="mb-3 text-lg font-semibold">Pagamentos:</h1>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              {#each order_details.payments as payment, i}
                <CardPayments {payment} {i} />
              {/each}
            </div>
            {#if order_details.is_fiado && order_details.amount_paid - troco < order_details.total}
              <div class="mt-5 flex flex-col gap-5">
                <h1 class="text-center font-bold">
                  O pagamento ainda está pendente <span class="text-error">
                    pendentes!
                  </span> Ainda faltam <span class="text-success">R${(((order_details.total)-(order_details.amount_paid - troco))/100).toFixed(2)}</span> para pagar 
                </h1>
                <button
                  class="btn btn-primary"
                  on:click={() => isOpenModal?.showModal()}
                >
                  Realizar pagamento
                </button>
              </div>
            {/if}
            {#if order_details.amount_paid - troco >= order_details.total}
              <h1 class="my-2 text-lg font-semibold text-success">
                &#128079; O pagamento já foi realizado para este pedido!
              </h1>
            {/if}
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
                  {order_details.address.complement}, {order_details.address
                    .neighborhood}, {order_details.address.city} - {order_details
                    .address.state}, CEP: {order_details.address.cep}
                </dd>
              </dl>
              <!-- <div class="flex justify-end">
                <button class="btn btn-link">Mudar endereço</button>
              </div> -->
              <!--TODO: mudar endereco e se !endereco colocar pra vincular se pedido ainda nao estiver pronto-->
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

{#if order_details?.is_fiado}
  <dialog class="modal" bind:this={isOpenModal}>
    <div class="modal-box max-w-2xl">
      <PaymentFiado
        closeFn={() => isOpenModal?.close()}
        total_pedido={order_details.total}
        order_id={order_details.id}
        {amount_paid_order}
      />
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
