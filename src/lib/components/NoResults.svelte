<script lang="ts">
    export let type = ''
</script>
<div class="mt-6 flex h-96 items-center rounded-lg text-center">
  <div class="mx-auto flex w-full max-w-sm flex-col px-4">
    <div class="mx-auto rounded-full bg-base-200 p-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </div>
    <h1 class="mt-3 text-lg font-semibold">Nenhum {type} encontrado</h1>
    <p class="mt-2">Sua busca não foi encontrada. Por favor tente novamente.</p>
  </div>
</div>
