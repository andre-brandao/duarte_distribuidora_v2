<script lang="ts">
  import type {
    InsertOrderPayment,
    SelectOrderPayment,
  } from '$lib/server/db/schema'
  import { icons } from '$lib/utils'
  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import CardPayments from './cards/CardPayments.svelte'
  import CurrencyInput from './input/CurrencyInput.svelte'
  import PaymentCashier from './PaymentCashier.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { modal } from './modal'
  import { onMount } from 'svelte'

  export let order_id: number

  export let cliente_selecionado:
    | RouterOutputs['customer']['getCustomers'][0]
    | null = null

  export let closeFn: undefined | (() => void)

  export let total_pedido = 0

  export let amount_paid_order:number

  $:console.log(amount_paid_order)

  let isLoading = false

  async function save() {
    isLoading = true
    try {
      if (newPayments.length >= 1) {
        for (let newPayment of newPayments) {
          await trpc($page).customer.insertOrderPayment.mutate(newPayment)
        }
      }

      toast.success('Pedido atualizado com sucesso!')
      window.location.reload()
      closeFn?.()
      isLoading = false
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar pagamento')
      isLoading = false
    }
  }

  let newPayments: InsertOrderPayment[] = []

  $: total_paid_newPayments = newPayments.reduce(
    (acc, payment) => acc + payment.amount_paid,
    0,
  )

  let valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order

  $:{valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order}
  $:console.log(valor_a_pagar)

  let valor_recebido_dinheiro = 0
  let troco = 0

  $: troco = valor_recebido_dinheiro - valor_a_pagar

  let metodo_pagamento: InsertOrderPayment['payment_method'] | null

  let isDiferent = false
  let isPago = false
  let isDinheiro = false
  let isFiado = false

  function divideValor(n: number) {
    valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order
    valor_a_pagar = valor_a_pagar / n
  }

  function addPayment() {
    if (metodo_pagamento === null) {
      toast.error('Nenhum metodo de pagamento selecionado!')
      return
    }

    if (valor_a_pagar <= 0) {
      toast.error('O valor a pagar não pode ser zero ou negativo!')
      return
    }

    if (metodo_pagamento === 'dinheiro' && troco < 0) {
      toast.error('Valor não pode ser menor que o valor a pagar')
      return
    }

    if (metodo_pagamento === 'dinheiro' && valor_recebido_dinheiro <= 0) {
      toast.error('O valor recebido em dinheiro não pode ser zero ou negativo!')
      return
    }

    if (total_paid_newPayments >= total_pedido) {
      toast.error('O valor pago não pode exceder o valor do pedido!')
      return
    }

    newPayments.push({
      amount_paid: isDinheiro ? valor_recebido_dinheiro : valor_a_pagar,
      status: 'CONFIRMED',
      payment_method: metodo_pagamento,
      troco: isDinheiro ? troco : null,
      order_id: order_id,
    })
    isDinheiro = false
    isPago = false
    isDiferent = true
    isFiado = false
    metodo_pagamento = null
    newPayments = [...newPayments]
  }
</script>

<div class="flex flex-col gap-2">
  <!-- <h1 class="text-center">
      Valor à pagar: <span class="font-bold text-success">
        R${(payment.amount_paid / 100).toFixed(2)}
      </span>
    </h1> -->
  <h1 class="mb-2 text-center">
    Valor à pagar: <span class="font-bold text-success">
      R${((total_pedido - amount_paid_order) / 100).toFixed(2)}
    </span>
  </h1>
  <div
    class="flex {total_pedido === total_paid_newPayments ||
    total_pedido < total_paid_newPayments
      ? 'flex-col-reverse'
      : 'flex-col'}"
  >
    {#if total_pedido <= amount_paid_order + total_paid_newPayments}
      <div class="mt-3 flex w-full flex-col items-center justify-center gap-2">
        <div class="badge badge-success gap-2">
          Valor total to pedido foi pago!
        </div>
        <button
          class="btn btn-secondary w-full"
          on:click={save}
          disabled={isLoading}
        >
          {isLoading
            ? 'Carregando...'
            : 'CLIQUE AQUI PARA CONFIRMAR O PAGAMENTO'}
        </button>
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        {#if isDiferent || isPago || isDinheiro}
          <button
            class="btn btn-secondary"
            disabled={newPayments.length > 0}
            on:click={() => {
              isDiferent = false
              isPago = false
              isDinheiro = false
              metodo_pagamento = null
              valor_recebido_dinheiro = 0
              valor_a_pagar = total_pedido
            }}
          >
            {@html icons.back()}
            Voltar
          </button>
        {:else}
          <h1 class="text-center text-xl">Qual metodo de pagamento?</h1>
        {/if}
        {#if isDiferent}
          <label class="form-control w-full items-center">
            <div class="label">
              <span class="label-text">
                Digite aqui o valor para este pagamento
              </span>
            </div>

            <div>
              <CurrencyInput bind:value={valor_a_pagar} />
              <button class="btn mt-2" on:click={() => divideValor(4)}>
                25%
              </button>
              <button class="btn" on:click={() => divideValor(2)}>50%</button>
              <button class="btn" on:click={() => divideValor(1.25)}>
                75%
              </button>
              <button
                class="btn"
                on:click={() =>
                  (valor_a_pagar = total_pedido - total_paid_newPayments - amount_paid_order)}
              >
                100%
              </button>
            </div>
            <p>
              Valor restante do pedido: R${(
                (total_pedido - total_paid_newPayments - amount_paid_order) /
                100
              ).toFixed(2)}
            </p>
          </label>
        {/if}
        {#if isPago}
          <div class="label">
            <span class="label-text">
              Selecione o metodo utilizado para pagar:
            </span>
          </div>
          <select
            class="select select-bordered w-full"
            bind:value={metodo_pagamento}
          >
            <option value="" disabled selected>Qual foi o metodo?</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de debito</option>
            <option value="pix">Pix</option>
          </select>
        {:else if isDinheiro}
          <div class="flex w-full items-center justify-center gap-4">
            <label class="form-control w-full gap-2">
              <div class="label">
                <span class="label-text">Valor recebido:</span>
                <span class="label-text-alt">(Valor pago pelo cliente)</span>
              </div>
              <CurrencyInput bind:value={valor_recebido_dinheiro} />
            </label>
          </div>
          {#if valor_recebido_dinheiro && (valor_recebido_dinheiro >= total_pedido || valor_recebido_dinheiro >= valor_a_pagar) && troco > 0}
            <h1 class="font-lg">
              Troco do cliente: <span class="font-bold">
                R${(troco / 100).toFixed(2)}
              </span>
            </h1>
          {/if}
        {:else}
          {#if !isDiferent}
            <button
              class="btn btn-primary"
              on:click={() => {
                isDiferent = !isDiferent
              }}
            >
              PAGAMENTO PARCIAL
              {@html icons.divide()}
            </button>
          {/if}
          <!-- {#if cliente_selecionado && !isDiferent}
            <button
              class="btn btn-primary w-full"
              on:click={() => {
                isFiado = true
              }}
            >
              FIADO
              {@html icons.fiado()}
            </button>
          {/if} -->
          <button
            class="btn btn-primary w-full"
            on:click={() => {
              isPago = true
              isDinheiro = false
              isFiado = false
            }}
          >
            PAGO
            {@html icons.paid()}
          </button>
          <button
            class="btn btn-primary w-full"
            on:click={() => {
              isDinheiro = true
              isPago = false
              isFiado = false
              metodo_pagamento = 'dinheiro'
            }}
          >
            DINHEIRO
            {@html icons.cashColor()}
          </button>
        {/if}
        {#if isDiferent || isPago || isDinheiro || isFiado}
          <hr />
          <button
            class="btn btn-primary w-full"
            on:click={addPayment}
            disabled={!(metodo_pagamento === 'dinheiro'
              ? valor_recebido_dinheiro >= valor_a_pagar
              : metodo_pagamento) || metodo_pagamento === null}
          >
            ADICIONAR PAGAMENTO
          </button>
        {/if}
      </div>
    {/if}
    {#if newPayments.length > 0}
      <div class="mt-5">
        {#if total_paid_newPayments < total_pedido && total_paid_newPayments - amount_paid_order != 0}
          <p>
            Foi pago: R${(total_paid_newPayments / 100).toFixed(2)} mas ainda faltam
            <span class="text-error">
              R${((total_pedido - total_paid_newPayments - amount_paid_order) / 100).toFixed(2)}
            </span>
            para pagar o pedido!
          </p>
          <hr class="my-2" />
          <p>
            Deseja que o valor restante de <span class="text-error">
              R${((total_pedido - total_paid_newPayments - amount_paid_order) / 100).toFixed(2)}
            </span>
            continue como fiado?
            <button class="text-lg text-accent underline" on:click={save}>
              Clique aqui
            </button>
          </p>
        {/if}

        <h3 class="mb-2 text-lg font-medium">Pagamentos feitos:</h3>
        {#each newPayments as payment, i}
          <div class="my-3 flex flex-col">
            <CardPayments {payment} {i} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
