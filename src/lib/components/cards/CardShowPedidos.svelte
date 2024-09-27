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

<div class="shadow-md rounded-lg p-4 bg-opacity-80  bg-base-200">
  <div class="flex justify-between mb-3">
    {#if order.is_fiado}
        <p class="text-error font-semibold">É um pedido fiado!</p>
      {/if}
      <div class="badge badge-info">
        <a href="/admin/orders/{order.id}" class="text-info-content flex items-center gap-2">
          Visualizar pedido completo
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
  </div>

  <div class="mb-3 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold text-opacity-80">Pedido #{order.id}</h3>
      <span class="px-3 py-1 bg-info bg-opacity-50  rounded-full text-sm">
        Status: {order.status}
      </span>
    </div>
    
    {#if order.customer}
      <p class="mb-2 text-opacity-70">
        <span class="font-semibold">Cliente:</span> {order.customer.name} - {order.customer.cellphone ?? 'Sem telefone'} - {order.customer.email}
      </p>
    {/if}
    <div class=" gap-6">
      {#if order.address}
        <div>
          <h4 class="text-lg font-semibold text-opacity-80 mb-2">Endereço de Entrega</h4>
          <p class="text-opacity-60">
            {order.address.street}, {order.address.number}, {order.address.neighborhood}, {order.address.city}, {order.address.state} - {order.address.cep}
          </p>
        </div>
      {:else}
        <h4 class="text-lg font-semibold text-opacity-80">Não possui endereço de entrega!</h4>
      {/if}
      
    </div>
    <div class="mt-4">
      <!-- <p class="text-opacity-60"><span class="font-semibold">Criado em:</span> {order.created_at}</p> -->
      <div class="">
        <div class="text-xl flex items-center gap-2">
          <span class="font-semibold text-xl">Valor do pedido:</span>
          <span class="text-success text-2xl font-bold">R${(order.total / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
    
  </div>

  <!-- <div class="mt-6">
    <h4 class="text-xl font-semibold text-opacity-80 mb-4">Itens do Pedido:</h4>
    <div class={`grid grid-cols-1 gap-4 xl:grid-cols-${columns}`}>
      {#each order.items as item}
        <div class=" border bg-base-100 border-base-200 rounded-lg p-4 shadow-sm">
          <div class="flex items-center">
            <img src={getImagePath(item.product.image)} alt="Imagem do Produto" class="w-20 h-20 object-cover rounded-md mr-4" />
            <div>
              <p class="font-semibold text-opacity-80">{item.product.name}</p>
              <p class="text-opacity-60">Quantidade: {item.quantity}</p>
              <p class="text-opacity-60">Unidade: <span class="font-bold text-info">R${(item.price / 100).toFixed(2)}</span></p>
              <p class="text-opacity-60">Total: <span class="font-bold text-success">R${((item.price / 100) * item.quantity).toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div> -->

  <div class=" flex flex-col sm:flex-row justify-between items-center gap-4">
    {#if order.observation}
      <div class="max-w-md">
        <p class="text-opacity-60"><span class="font-semibold">Observações:</span> {order.observation}</p>
      </div>
    {/if}

    <div class="flex gap-2 w-full">
      {#if button_recusar}
        <button on:click={click_refuse} class="btn btn-error w-full">
          {button_recusar}
        </button>
      {/if}
      {#if button_text}
        <button on:click={click_confirm} class="btn btn-info w-full">
          {button_text}
        </button>
      {/if}
    </div>
  </div>
</div>
