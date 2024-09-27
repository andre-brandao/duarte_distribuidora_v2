<script lang="ts">
  import TransactionsModal from './TransactionsModal.svelte'
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import type { PageData } from './$types'
  import { icons } from '$lib/utils/icons'
  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { modal } from '$components/modal'

  import { getCartContext } from '$lib/stores/cart'
  import ModalEndereco from './ModalEndereco.svelte'
  import ModalCliente from './ModalCliente.svelte'
  import { onDestroy } from 'svelte'
  //import ModalPagamento from './ModalPagamento.svelte'
  import CaixaColumn from './CaixaColumn.svelte'
  import type { InsertOrderPayment } from '$lib/server/db/schema'
  import PaymentCashier from '$lib/components/PaymentCashier.svelte'
  import CardapioCaixa from './CardapioCaixa.svelte'
  import CaixaLeftColumn from './CaixaLeftColumn.svelte'
  import ModalMotoboy from './ModalMotoboy.svelte'

  const cart = getCartContext()

  export let data: PageData

  let { caixa, user, products } = data

  let filteredProducts = products

  let isOpenModal: HTMLDialogElement | null = null

  let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'

  let observacao: string = ''

  let clienteSelecionado: RouterOutputs['customer']['getCustomers'][0] | null =
    null

  let enderecoCliente:
    | RouterOutputs['customer']['getCustomers'][0]['adresses'][0]
    | null = null

  let motoboySelecionado: RouterOutputs['auth']['getMotoboys'][0] | null = null

  let isDelivery = false

  async function createOrder(
    payments: Omit<InsertOrderPayment, 'order_id'>[],
    isChecked: boolean,
  ) {
    let total = Object.values($cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0)
    try {
      // TODO: add new cases
      const resp = await trpc($page).customer.order.insetPaidOrder.mutate({
        order_info: {
          customer_id: clienteSelecionado?.id,
          address_id: clienteSelecionado?.adresses[0].id,
          total: total,
          observation: observacao,
          motoboy_id: isDelivery ? motoboySelecionado?.id : undefined,
          type: 'ATACADO',
          //TODO: Type
          cashier_id: caixa.id,
          payment_info: payments,
        },
        order_items: Object.values($cart).map(item => ({
          product_id: item.item.id,
          quantity: item.quantity,
          price: item.item[item.is_retail ? 'retail_price' : 'wholesale_price'],
        })),
      })
      if (!resp) {
        toast.error('Erro ao criar pedido')
        return
      }


      toast.success('Pedido realizado com sucesso!')

      setTimeout(() => {
        modal.close()
        clienteSelecionado = null
        enderecoCliente = null
        motoboySelecionado = null
      }, 300)

      cart.set({})
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  let dinheiro_caixa = 0


  async function handleAbrirCaixa() {
    try {
      const resp = await trpc($page).distribuidora.abrirCaixa.mutate({
        id: caixa.id,
        data: {
          amount: dinheiro_caixa,
        },
      })

      console.log(resp)
      toast.success('Caixa aberto com sucesso!')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleFecharCaixa() {
    const confirmacao = confirm(
      'Você está prestes a fechar o caixa. Deseja continuar?',
    )

    if (!confirmacao) {
      return
    }
    try {
      const resp = await trpc($page).distribuidora.fecharCaixa.mutate({
        id: caixa.id,
        data: {
          amount: dinheiro_caixa,
        },
      })
      console.log(resp)
      toast.success('Caixa fechado com sucesso!')
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function seeTransactionsCaixa() {
    modal.open(TransactionsModal, {
      caixa_id: caixa.id,
    })
  }

  async function pagamentoModal() {
    let total = Object.values($cart).reduce((acc, item) => {
      return (
        acc +
        item.item[item.is_retail ? 'retail_price' : 'wholesale_price'] *
          item.quantity
      )
    }, 0)
    modal.open(PaymentCashier, {
      cliente_selecionado: clienteSelecionado,
      total_pedido: total,
      motoboySelecionado:motoboySelecionado,
      save: (payments, isChecked) => {
        createOrder(payments, isChecked)
      },
    })
  }

  onDestroy(() => {
    cart.set({})
  })
</script>

<div class="m-4 flex justify-center">
  <button class="btn btn-primary" on:click={seeTransactionsCaixa}>
    Ver transacoes do caixa
  </button>
</div>
<h1 class="mb-1 text-center text-3xl font-semibold">Caixa:</h1>
{#if caixa.status === 'Aberto'}
  <div class="flex justify-center">
    <label class="form-control w-full max-w-xs gap-2">
      <div class="label justify-center">
        <span class="label-text">Digite o valor no caixa!</span>
      </div>
      <CurrencyInput bind:value={dinheiro_caixa} />
      <button class="btn btn-primary" on:click={handleAbrirCaixa}>
        Abrir caixa
      </button>
    </label>
  </div>
{:else}
  <div class="mb-3 flex justify-center gap-2">
    <button class="btn btn-error" on:click={handleFecharCaixa}>
      Fechar caixa
    </button>
  </div>
  <div class="mt-15 m-4 flex flex-col justify-center gap-4 md:flex-row">
    <CaixaLeftColumn
      {caixa}
      {user}
      bind:tipo_preco
      bind:clienteSelecionado
      bind:enderecoCliente
      bind:isDelivery
      bind:motoboySelecionado
    />
    <div
      class="col-auto rounded-lg border-4 border-secondary border-opacity-50 p-4"
    >
      <CaixaColumn />
    </div>

    <div class="col-auto flex h-auto flex-col justify-between gap-2 md:w-96">
      <div>
        <button
          class="btn btn-primary w-full"
          on:click={() => isOpenModal?.showModal()}
        >
          ACESSAR PRODUTOS {@html icons.basket()}
        </button>
        <p class="mb-2 mt-4">Observações sobre compra:</p>
        <textarea
          bind:value={observacao}
          placeholder="Anotar observacões..."
          class="textarea textarea-bordered textarea-lg mb-5 w-full"
        ></textarea>
      </div>
      <div class="flex flex-col gap-2">
        <button class="btn btn-primary w-full disabled:bg-opacity-50">
          <span class="mr-1">IMPRIMIR</span>
          {@html icons.print()}
        </button>
        <button
          class="btn btn-primary w-full disabled:bg-opacity-50"
          disabled={Object.values($cart).length === 0}
          on:click={pagamentoModal}
        >
          <span class="mr-1">PAGAMENTO</span>
          {@html icons.dolar()}
        </button>
      </div>
    </div>
  </div>
{/if}

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <CardapioCaixa products={filteredProducts} {tipo_preco}/>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
