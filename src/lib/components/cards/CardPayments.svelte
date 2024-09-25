<script lang="ts">
  export let payment
  export let i
</script>

<div
  class="rounded-lg {payment.payment_method === 'fiado'
    ? 'bg-error bg-opacity-25'
    : 'bg-base-200'} p-4 shadow-sm"
>
  Pagamento #{i + 1}
  <p class="bg-opacity-60">
    <span class="font-semibold">Quantidade paga:</span>
    R${(payment.amount_paid / 100).toFixed(2)}
  </p>
  {#if payment.payment_method === 'dinheiro'}
    <p class="bg-opacity-60">
      <span class="font-semibold">Troco:</span>
      R${payment.troco ? (payment?.troco / 100).toFixed(2) : null}
    </p>
  {/if}
  <p class="bg-opacity-60">
    <span class="font-semibold">Método de pagamento:</span>
    {payment.payment_method}
  </p>
</div>
