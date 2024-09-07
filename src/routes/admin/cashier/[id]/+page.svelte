<script lang="ts">
	import TransactionsModal from './TransactionsModal.svelte';
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'
  import type { PageData } from './$types'
  import Cardapio from '$lib/components/Cardapio.svelte'
  import { icons } from '$lib/utils/icons'
  import { getImagePath } from '$lib/utils/image'

  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { modal } from '$components/modal'
  
  import { getCartContext } from '$lib/stores/cart'
  import ModalEndereco from './ModalEndereco.svelte'
  import ModalCliente from './ModalCliente.svelte'
  import { onDestroy } from 'svelte';
  import ModalPagamento from './ModalPagamento.svelte'
  import CaixaColumn from './CaixaColumn.svelte'

  const cart = getCartContext()

  export let data: PageData

  let { caixa, user, products } = data

  let isOpenModal: HTMLDialogElement | null = null

  let tipo_preco: 'retail_price' | 'wholesale_price' = 'retail_price'

  let observacao: string = ''

  let clienteSelecionado: RouterOutputs['customer']['getCustomers'][0] | null =
    null

  let enderecoCliente: RouterOutputs['customer']['getCustomers'][0]['adresses'][0] | null = null

  let filteredProducts = products

  $:console.log(filteredProducts)

  //TODO:TIPAGEM DA VARIAVEL metodo_pagamento - status_pagamento
  async function createOrder(metodo_pagamento: any,status_pagamento:any,isChecked:boolean,amount_paid:number) {
    let total = Object.values($cart).reduce((acc, item) => {
    return acc + item.item[item.is_retail ? 'retail_price': 'wholesale_price'] * item.quantity
    }, 0)
    try {  
        const resp = await trpc($page).customer.insertOrder.mutate({
          order_info: {
            customer_id: clienteSelecionado?.id,
            address_id: clienteSelecionado?.adresses[0].id,
            total: total,
            observation: observacao,
          },
          payment_info:{
            payment_method: metodo_pagamento,
            payment_status: status_pagamento,
            amount_paid:amount_paid
          },
          order_items: Object.values($cart).map(item => ({
            product_id: item.item.id,
            quantity: item.quantity,
            price: item.item[item.is_retail ? 'retail_price':'wholesale_price'],
            //price: 12,
          })),
        })

        if(!resp){
          toast.error('Erro ao criar pedido')
          return
        }

        toast.success('Pedido realizado com sucesso!')

        if(isChecked){
          const respUpdate = await trpc($page).customer.updateOrderStatus.mutate({
            order_id: resp.order.id,
            status: 'ENDED'
        })
        toast.info('Finalizando pedido..')
        }

        setTimeout(() => {
        modal.close();
        clienteSelecionado = null
        enderecoCliente = null
        }, 300);
        
        cart.set({})
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  function handleSelectClient() {
    modal.open(ModalCliente, {
      selectedClient: client => {
        clienteSelecionado = client
        modal.open(ModalEndereco, {
          addresses: client.adresses,
          selectedAddress: address => {
            enderecoCliente = address
            //TODO:ARRUMAR TIPO
            console.log(address);          
          }
        })
        if (clienteSelecionado.is_retail) {
          tipo_preco = 'retail_price'
        } else {
          tipo_preco = 'wholesale_price'
        }
      },
    })
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
    const confirmacao = confirm('Você está prestes a fechar o caixa. Deseja continuar?');
    
    if (!confirmacao) {
        return;
    }
    try {
        const resp = await trpc($page).distribuidora.fecharCaixa.mutate({
            id: caixa.id,
            data: {
                amount: dinheiro_caixa,
            },
        });
        console.log(resp);
        toast.success('Caixa fechado com sucesso!');
        window.location.reload();
    } catch (error: any) {
        toast.error(error.message);
    }
}

async function seeTransactionsCaixa(){
  modal.open(TransactionsModal, {
      caixa_id:caixa.id
  })
}

async function pagamentoModal(){
  let total = Object.values($cart).reduce((acc, item) => {
    return acc + item.item[item.is_retail ? 'retail_price': 'wholesale_price'] * item.quantity
    }, 0)
  modal.open(ModalPagamento, {
    cliente_selecionado: clienteSelecionado,
    total_pedido:total,
    realizarPedido: (metodo_pagamento,status_pagamento,isChecked,amount_paid) => {
      createOrder(metodo_pagamento,status_pagamento,isChecked,amount_paid)
    }
  })
}

onDestroy(() =>  {
  cart.set({});
}
)
</script>
<div class="flex justify-center m-4">
  <button class="btn btn-primary" on:click={seeTransactionsCaixa}>Ver transacoes do caixa</button>
</div>
    <h1 class="text-center text-3xl font-semibold mb-1">Caixa:</h1>
{#if caixa.status === 'Fechado'}
  <div class="flex justify-center">
    <label class="form-control w-full max-w-xs gap-2">
      <div class="label justify-center">
        <span class="label-text">Digite o valor no caixa!</span>
      </div>
      <CurrencyInput bind:value={dinheiro_caixa} />
      <button class="btn btn-primary" on:click={handleAbrirCaixa}>Abrir caixa</button>
    </label>
  </div>
{:else}
<div class="flex justify-center gap-2 mb-3">
  <button class="btn btn-error" on:click={handleFecharCaixa}>Fechar caixa</button>
</div>
  <div class="mt-15 flex flex-col justify-center gap-4 md:flex-row m-4">
    <div class="flex h-auto md:flex-col flex-col-reverse justify-between">
      <h2 class="text-3xl font-bold hidden md:block mb-2">Informações do pedido:</h2>
      <div>

        <h1 class="text-center">Selecione o tipo de preco</h1>
        <div class="flex w-full flex-col lg:flex-row">

          <div class="grid flex-grow place-items-center">
            <button class="btn w-full btn-primary" on:click={()=> {tipo_preco = 'retail_price'}} disabled={tipo_preco === 'retail_price' || Object.values($cart).length >= 1}>Varejo</button>
          </div>
          <div class="divider lg:divider-horizontal">OU</div>
          <div class="grid flex-grow place-items-center">
            <button class="btn w-full btn-primary" on:click={()=> {
              tipo_preco = 'wholesale_price'
              }} 
              disabled={tipo_preco === 'wholesale_price' || Object.values($cart).length >= 1}>Atacado</button>
          </div>
        </div>

      </div>
      <div
        class={`mt-3 w-full rounded-lg px-3 py-1 text-center font-bold hidden md:block  ${
          caixa.status === 'Aberto' ? 'bg-success' : 'bg-error'
        }`}
      >
        {caixa.status === 'Aberto' ? 'Em aberto' : 'Fechado'}
      </div>
      <div class="my-4">
        <p>
          Número do pedido: <span class="font-bold text-primary">
            #{caixa.id}
          </span>
        </p>
        <p>
          Criado por: <span class="font-bold text-primary">{user?.email}</span>
        </p>
      </div>
      <div class="flex md:flex-col flex-col-reverse  gap-2">
        {#if clienteSelecionado}
          <div class="flex items-center justify-between">
            <p class="font-bold">{clienteSelecionado.name}</p>
            <button
              class="btn btn-primary"
              on:click={() => (clienteSelecionado = null, enderecoCliente = null)}
            >
              Desvincular
            </button>
          </div>
        {:else}
          <button
            class="btn btn-outline w-full disabled:bg-opacity-50"
            on:click={handleSelectClient}
          >
            <span class="mr-1">Vincular compra a um cliente</span>
          </button>
        {/if}
        {#if enderecoCliente}
        <div class="flex-wrap items-center justify-between max-w-[50vh]">
          {enderecoCliente?.cep}
          {enderecoCliente?.city}, {enderecoCliente?.neighborhood}, {enderecoCliente
            ?.street}, {enderecoCliente?.number}
          </div>
        {/if}
        <a
          href="/admin/cashier"
          class="btn btn-primary w-full disabled:bg-opacity-50"
          on:click={() => cart.set({})}
        >
          <span class="mr-1">CANCELAR</span>
          {@html icons.x()}
        </a>
      </div>
    </div>

    <div
      class="col-auto rounded-lg border-4 border-secondary border-opacity-50 p-4"
    >
     <CaixaColumn/>
    </div>

    <div class="col-auto flex h-auto md:w-96 flex-col justify-between gap-2">
      <div>
        <button
          class="btn btn-primary w-full"
          on:click={()=> isOpenModal?.showModal()}>
          ACESSAR PRODUTOS {@html icons.basket()}
        </button>
        <p class="mb-2 mt-4">Observações sobre compra:</p>
        <textarea
          bind:value={observacao}
          placeholder="Anotar observacões..."
          class="textarea textarea-bordered textarea-lg mb-5 w-full"
        ></textarea>
      </div>
      <div class="flex flex-col gap-2 ">
          <button class="btn btn-primary w-full disabled:bg-opacity-50">
            <span class="mr-1">IMPRIMIR</span>
            {@html icons.print()}
          </button>
        <button
          class="btn btn-primary w-full disabled:bg-opacity-50"
          on:click={pagamentoModal}
          disabled={Object.values($cart).length===0}
        >
          <span class="mr-1">PAGAMENTO</span>
          {@html icons.dolar()}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <Cardapio data={filteredProducts} onFilterChange={(value)=> {
        filteredProducts = products
          .map((product) => {
            const filteredSubProducts = product.products.map((subProduct) => {
              const filteredItems = subProduct.items.filter((item) =>
                item.name.toLowerCase().includes(value)
              );
              return { ...subProduct, items: filteredItems };
            });

            return { ...product, products: filteredSubProducts };
          })
          .filter((product) =>
            product.products.some((subProduct) => subProduct.items.length > 0)
          );

        }}>
      {#snippet card(p)}
          <div class="card w-full p-1">
            <div class="grid grid-cols-1 gap-3">
              {#each p.items as item}
                {@const cartItem = $cart[item.id]}
  
                <hr />
                <div class="flex w-full py-2">
                  <div class=" flex-none md:w-auto hidden md:block">
                    <img
                      alt="imagem"
                      src={getImagePath(item.image)}
                      class="h-16 w-16 rounded-lg object-cover md:h-20 md:w-20"
                    />
                  </div>
                  <div class="ml-4 w-full">
                    <h2 class="md:text-xl font-bold">{item.name}</h2>
                    <h3 class="md:text-md text-secondary">{p.description}</h3>
                  </div>
                  <div class="w-full text-right">
                    <span class="block pb-3 text-xl font-bold">
                      R${(item[tipo_preco]/100).toFixed(2)}
                    </span>
                    <div class="flex items-center justify-end gap-3 text-center">
                      {#if cartItem?.quantity >= 1}
                        <button
                          class="btn btn-primary hidden md:block"
                          on:click={()=> {
                            if(cartItem.quantity <=  1){
                              cart.removeItem(item.id)
                            } else {
                              cart.addItem({
                                item: item,
                                quantity: -1,
                                is_retail: tipo_preco=='retail_price'? true : false
                              })
                            }
                          }}>
                          {@html icons.minus()}
                        </button>
                      {/if}
                      <input
                        min="1"
                        class="md:min-w-10 md:max-w-28 max-w-16  bg-base-100 text-right text-xl font-bold focus:border-yellow-500"
                        value={$cart[item.id]?.quantity ?? 0}
                        on:change={e => {
                          const quant_temp = (e.target as HTMLInputElement)?.value
                          cart.setItem({
                            item: item,
                            quantity: Number(quant_temp),
                            is_retail: tipo_preco=='retail_price'? true: false
                          })
                        }}
                      />
                      <button
                        on:click={() =>
                          cart.addItem({
                            item: item,
                            quantity: 1,
                            is_retail: tipo_preco=='retail_price'? true: false
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
  
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>