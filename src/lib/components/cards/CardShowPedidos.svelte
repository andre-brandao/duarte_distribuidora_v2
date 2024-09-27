<script lang="ts">
  import type { CurrentOrders } from '$db/schema/customer/controller.ts'
  import { getImagePath } from '$lib/utils'

  export let click_confirm = () => {}
  export let click_refuse = () => {}

  export let button_text = ''
  export let button_recusar = ''
  export let order: CurrentOrders[0]
  export let columns = 1

  function paymentStatusColor(status: string) {
    switch (status) {
      case 'PENDING':
        return ' badge-warning text-warning-content'
      case 'CONFIRMED':
        return ' badge-success text-success-content'
      case 'CANCELED':
        return ' badge-error text-error-content'
      case 'REFUNDED':
        return ' badge-info text-info-content'
      default:
        return ' badge-neutral text-neutral-content'
    }
  }
</script>

<!-- <div class="mb-4 flex justify-between gap-1 text-center text-sm">
    <div class="flex flex-col items-start">
      <h3>
        Pedido <strong>#{order.id}</strong>
      </h3>
      <p>Data: {order.created_at}</p>
      <p>Status pagamento: {order.payment_status}</p>
    </div>
    <div class="flex flex-col items-end">
      <p>
        Pagamento em <strong>{order.payment_method}</strong>
      </p>
      <p>
        Total: <strong class="text-lg text-success">
          R${(order.total / 100).toFixed(2)}
        </strong>
      </p>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    {#if order.address}
      Endereco: {order.address?.cep}
      {order.address?.city}, {order.address?.neighborhood}, {order.address
        ?.street}, {order.address?.number}, {order.address?.complement}
    {/if}
    {#if order.customer}
      <p class="text-sm">
        <strong>Cliente:</strong>
        {order.customer?.name} - {order.customer?.cellphone ??
          'Telefone sem registro'} - {order.customer?.email}
      </p>
    {/if}
  </div>
  <div class="mt-4">
    <h4 class="mb-2 text-lg font-semibold">Produtos pedidos:</h4>
    <div class="flex flex-col gap-1 overflow-x-auto sm:flex-row">
      {#each order.items as item}
        <div class="flex rounded-md bg-base-100 p-2 shadow-sm">
          <p class="text-base">
            <strong>{item.quantity}x</strong>
            - {item.product.name} -
            <span class="font-bold text-success">
              R${(item.price / 100).toFixed(2)}
            </span>
          </p>
        </div>
      {/each}
    </div>
  </div> -->

<div class="card p-2">
  <div class="flex justify-end">
    <a href="/admin/orders/{order.id}" class="flex underline gap-2">
      Visualizar pedido <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-move-right"
      >
        <path d="M18 8L22 12L18 16" />
        <path d="M2 12H22" />
      </svg>
    </a>
  </div>
  <div class="mb-4 rounded-lg border bg-base-200 p-4">
    {#if order.customer}
      <p class="mb-2 text-lg">
        <strong>Cliente:</strong>
        {order.customer?.name} - {order.customer?.cellphone ??
          'Telefone sem registro'} - {order.customer?.email}
      </p>
    {/if}
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-2xl font-semibold">Pedido #{order.id}</h3>
      <div class="badge badge-primary flex items-center">
        <p>
          Status do pedido: <span class="text-lg font-bold">
            {order.status}
          </span>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <!-- <div
          class={`badge font-semibold ${paymentStatusColor(order.payment_status)}`}
        >
          {order.payment_status}
        </div> -->
        <p>
          <span class="font-semibold">Criado em:</span>
          {order.created_at}
        </p>
        <span class="font-semibold">Total:</span>
        <span class="text-xl font-bold text-success">
          R${(order.total / 100).toFixed(2)}
        </span>
      </div>

      {#if order.address}
        <div>
          <h4 class="text-lg font-semibold">Endereço de Entrega</h4>
          <p>
            {order.address?.street}, {order.address?.number}, {order.address
              ?.neighborhood}
          </p>
          <p>
            {order.address?.city}, {order.address?.state} - {order.address?.cep}
          </p>
          <p>{order.address?.country}</p>
        </div>
      {:else}
        <h4 class="text-lg font-semibold">Não possui endereço de entrega!</h4>
      {/if}
    </div>

    <div class="mt-6">
      <h4 class="mb-4 text-lg font-semibold">Itens do Pedido:</h4>
      <div class={`grid grid-cols-1 gap-4 xl:grid-cols-${columns}`}>
        {#each order.items as item}
          <div class="rounded-lg border bg-base-100 p-4 shadow-sm">
            <div class="flex items-center">
              <img
                src={getImagePath(item.product.image)}
                alt="Imagem do Produto"
                class="mr-4 h-20 w-20 rounded-md object-cover"
              />

              <div>
                <p class="text-lg font-semibold text-gray-900">
                  {item.product.name}
                </p>
                <p class="">Quantidade: {item.quantity}</p>
                <p class="">
                  Preço: <strong class="text-secondary">
                    R${(item.price / 100).toFixed(2)}
                  </strong>
                </p>
                <p>
                  Total:
                  <strong class="text-success">
                    R${((item.price / 100) * item.quantity).toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <div
      class="mt-3 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      {#if order.observation}
        <div class="max-w-96">
          <p>Observacoes: {order.observation}</p>
        </div>
      {/if}

      <div class="flex w-full justify-end gap-2">
        {#if button_recusar}
          <button class=" btn btn-error" on:click={() => click_refuse()}>
            {button_recusar}
          </button>
        {/if}
        {#if button_text}
          <button class="btn btn-primary" on:click={() => click_confirm()}>
            {button_text}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
