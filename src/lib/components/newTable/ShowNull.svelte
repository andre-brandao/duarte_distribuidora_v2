<script lang="ts">
  export let value
</script>

{#if value === null || !value}
  <span class="text-error">Não tem</span>
{:else}
  {value}
{/if}
