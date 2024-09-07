<script lang="ts">
  import CurrencyInput from './input/CurrencyInput.svelte'

  export let total_pedido = 0

  let valor_a_pagar = total_pedido
  $: valor_restante = total_pedido - valor_a_pagar
  $: console.log(valor_a_pagar)

  let valor_recebido_dinheiro = 0
  let troco = 0
  $: troco = valor_recebido_dinheiro - total_pedido

  let metodo_pagamento = ''

  let isDiferent = false
  let isPago = false
  let isDinheiro = false

  function divideValor(n: number) {
    valor_a_pagar = total_pedido
    valor_a_pagar = valor_a_pagar / n
  }
</script>

<div class="flex flex-col gap-3">
  {#if isDiferent || isPago || isDinheiro}
    <button
      class="btn btn-secondary"
      on:click={() => {
        isDiferent = false
        isPago = false
        isDinheiro = false
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-undo-2"
      >
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
      </svg>
      Voltar
    </button>
  {:else}
    <h1 class="text-center text-xl">Qual metodo de pagamento?</h1>
  {/if}

  {#if isDiferent}
    <label class="form-control w-full items-center">
      <div class="label">
        <span class="label-text">Digite aqui o valor para este pagamento</span>
      </div>

      <div>
        <CurrencyInput bind:value={valor_a_pagar}/>
        <button class="btn mt-2" on:click={() => divideValor(4)}>25%</button>
        <button class="btn" on:click={() => divideValor(2)}>50%</button>
        <button class="btn" on:click={() => divideValor(1.25)}>75%</button>
        <button class="btn" on:click={() => (valor_a_pagar = total_pedido)}>
          100%
        </button>
      </div>
      <p>Valor restante do pedido: R${(valor_restante / 100).toFixed(2)}</p>
    </label>
    {/if}
  {#if isPago}
    <div class="label">
      <span class="label-text">Selecione o metodo utilizado para pagar:</span>
    </div>
    <select class="select select-bordered w-full" bind:value={metodo_pagamento}>
      <option disabled selected>Qual foi o metodo?</option>
      <option value="credit_card">Cartão de crédito</option>
      <option value="debit_card">Cartão de debito</option>
      <option value="pix">Pix</option>
      <option value="dinheiro">Dinheiro</option>
    </select>
    <button class="btn btn-primary w-full" disabled={metodo_pagamento === ''}>
      CONFIRMAR
    </button>
    <hr class="w-full bg-base-300" />
  {:else if isDinheiro}
    <div class="flex w-full items-center justify-center gap-4">
      <label class="form-control w-full gap-2">
        <div class="label">
          <span class="label-text">Valor recebido:</span>
          <span class="label-text-alt">(Valor pago pelo cliente)</span>
        </div>
        <CurrencyInput bind:value={valor_recebido_dinheiro} />
        <button
          class="btn btn-accent"
          disabled={total_pedido >= valor_recebido_dinheiro}
        >
          CONFIRMAR
        </button>
      </label>
    </div>
    {#if valor_recebido_dinheiro && valor_recebido_dinheiro >= total_pedido}
      <h1 class="font-lg">
        Troco do cliente: <span class="font-bold">
          R${(troco / 100).toFixed(2)}
        </span>
      </h1>
    {/if}
  {:else}
    <button
      class="btn btn-primary"
      disabled={isDiferent}
      on:click={() => {
        isDiferent = !isDiferent
      }}
    >
      PAGAMENTO PARCIAL
    </button>
    <button class="btn btn-primary w-full">FIADO</button>
    <button
      class="btn btn-primary w-full"
      on:click={() => {
        ;(isPago = true), (isDinheiro = false)
      }}
    >
      PAGO
    </button>
    <button
      class="btn btn-primary w-full"
      on:click={() => {
        isDinheiro = true
        isPago = false
      }}
    >
      DINHEIRO
    </button>
  {/if}
</div>
