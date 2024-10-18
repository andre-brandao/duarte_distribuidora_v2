<script lang="ts">
  import type { CurrentOrders } from '$db/schema/customer/controller.ts'
  import { getImagePath } from '$lib/utils'
  import PaymentFiado from '../PaymentFiado.svelte'
  import { format } from 'date-fns';

  export let click_confirm = () => {}
  export let click_refuse = () => {}

  export let button_text = ''
  export let button_recusar = ''
  export let order: CurrentOrders[0]
  export let columns = 1

  export let troco = 0
  
  let isOpenModal: HTMLDialogElement | null = null

  let amount_paid_order = (order?.amount_paid ?? 0) - troco
</script>

<div class="rounded-lg bg-base-200 bg-opacity-80 p-2 shadow-md">
  <div class="flex justify-between">
    <div class="flex items-center gap-3">
      <span class="font-semibold">
        {format(order.created_at,'dd/MM/yyyy')}
      </span>
        {#if order.is_fiado}
          <p class="text-sm font-semibold text-error">É um pedido fiado!</p>
        {/if}
        <!-- {#if order.payments.length === 0}
          <span class="text-sm text-warning">Pagamento ainda pendente</span>
        {/if} -->
      <!-- {#if order.motoboy_id}
        <p class="text-sm font-semibold text-success">É um pedido delivery!</p>
      {/if} -->
    </div>
    <div class="badge badge-info bg-opacity-40">
      <!--TODO: data-->
      <a
        href="/admin/orders/{order.id}"
        class="flex items-center gap-2 text-info-content"
      >
        Visualizar pedido completo
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </div>

  <div class=" rounded-lg">
    <div class="flex justify-between items-center">
      {#if order.customer}
        <p class=" text-opacity-70">
          <span class="font-semibold">Cliente:</span>
          {order.customer.name}
        </p>
        {/if}
        {#if order.payments.length === 0}
            <span class="text-sm text-error">Pagamento ainda pendente</span>
          {/if}
    </div>
    <div class="">
      <!-- <p class="text-opacity-60"><span class="font-semibold">Criado em:</span> {order.created_at}</p> -->
      <div class="flex flex-col items-start justify-between">
        <div class="flex items-center gap-2">
          {#if order.taxa_entrega}
            <span>Taxa entrega: <span class="font-bold text-neutral ">R${(order?.taxa_entrega / 100).toFixed(2)}</span> </span>
          {/if}
          -
          <span class="text-md font-semibold">Valor do pedido:</span>
          <span class="text-lg font-bold text-success">
            R${(order.total / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class=" flex flex-col items-center justify-between gap-4 sm:flex-row">
    <div class="flex w-full gap-2">
      {#if button_recusar}
        <button on:click={click_refuse} class="badge py-3 badge-error w-full">
          {button_recusar}
        </button>
      {/if}
      {#if button_text && (order.status !== 'ON THE WAY' || order.payments.length !== 0 || order.is_fiado)}
        <button on:click={click_confirm} class="badge py-3 badge-info w-full">
          {button_text}
        </button>
      {/if}
      {#if order.motoboy_id && !order.is_fiado && order.status === 'ON THE WAY' && order.payments.length === 0}
         <button class="badge badge-primary py-3 w-full" on:click={() => isOpenModal?.showModal()}>FOI PAGO</button>
      {/if}
    </div>
  </div>
</div>

  <dialog class="modal" bind:this={isOpenModal}>
    <div class="modal-box max-w-2xl">
      <PaymentFiado
        closeFn={() => isOpenModal?.close()}
        total_pedido={order.total}
        order_id={order.id}
        {amount_paid_order}
      />
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
