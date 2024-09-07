<script lang="ts" generics="T extends { name: string }">
  import type { Snippet } from 'svelte'

  interface CardapioProps {
    data: {
      id: any
      name: string
      products: T[]
    }[]
    card: Snippet<[T]>
    onFilterChange?: (search: string) => void
  }

  // interface CardapioProps {
  //   data: Record<string, T[]>
  //   card: (row: T) => any
  // }
  let { data, card, onFilterChange }: CardapioProps = $props()

  let selected = $state('')

  let preventSelect = false
  let scrollContainer: HTMLElement

  function changeSelection(new_selection: string) {
    if (preventSelect) {
      return
    }

    selected = new_selection

    const anchor = document.getElementById(`head-${new_selection}`)
    console.log(anchor, scrollContainer)

    if (anchor && scrollContainer) {
      // calculate the position to scroll to
      const scrollPosition =
        anchor.offsetLeft -
        scrollContainer.clientWidth / 2 +
        anchor.clientWidth / 2

      // scroll to the position smoothly
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }
  let timeoutId: NodeJS.Timeout | null = null

  function scrollIntoView(event: {
    preventDefault: () => void
    currentTarget: HTMLAnchorElement
  }) {
    preventSelect = true
    event.preventDefault()
    const link = event.currentTarget
    const anchorId = new URL(link.href).hash.replace('#', '')
    const anchor = document.getElementById(anchorId)
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    selected = anchorId

    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      preventSelect = false
      // changeSelection(anchorId)
      timeoutId = null // Reset the timeout ID
    }, 2000)
  }
  function onViewportEnter(node: HTMLElement, callback: () => void) {
    const observer = new IntersectionObserver(entries => {
      // Check if the element is intersecting
      if (entries[0].isIntersecting) {
        callback() // Call the provided callback function
        // observer.unobserve(node) // Stop observing the element
      }
    })

    // Observe the node
    observer.observe(node)

    return {
      destroy() {
        observer.disconnect() // Clean up the observer when the element is destroyed
      },
    }
  }
</script>

<main class="mx-1">
  <div class="sticky top-1 z-10 mx-2 flex gap-3 pt-2">
    <div
      class="hide-scrollbar flex w-full gap-3 overflow-y-hidden overflow-x-scroll rounded-box bg-base-200 p-2 shadow-xl"
      bind:this={scrollContainer}
    >
      {#each data as d}
        <a
          id="head-{d}"
          class="btn hover:translate-y-0.5 {selected === d.id
            ? 'bg-primary'
            : 'bg-base-100'}"
          href="#{d.id}"
          onclick={scrollIntoView}
        >
          {d.name}
        </a>
      {/each}
    </div>
    {#if onFilterChange}
      <div class="hidden md:block">
        <label class="input input-bordered flex h-full items-center gap-2">
          <input
            type="text"
            class="grow"
            placeholder="Search"
            oninput={e => {
              const value = (e.target as HTMLInputElement).value
              onFilterChange(value)
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4 opacity-70"
          >
            <path
              fill-rule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </label>
      </div>
    {/if}
  </div>
  <div class=" container mx-auto flex flex-col gap-3">
    {#if data.length === 0}
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
          <h1 class="mt-3 text-lg font-semibold">Nenhum produto encontrado</h1>
          <p class="mt-2">
            Sua busca não foi encontrada. Por
            favor tente novamente.
          </p>
          <div class="mt-4 flex items-center gap-x-3 sm:mx-auto">
            <button class="btn btn-primary" onclick={()=> {
              if(onFilterChange){
                onFilterChange('')
              }
            }}>Limpar busca</button>
          </div>
        </div>
      </div>
    {:else}
      {#each data as category}
        <div class="flex flex-col">
          <div
            id={category.id}
            class="divider my-4 py-4 text-center text-2xl font-bold"
            use:onViewportEnter={() => {
              changeSelection(category.id)
            }}
          >
            {category.name}
          </div>

          <div class="flex flex-wrap justify-around gap-4">
            {#each category.products as product}
              {@render card(product)}
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</main>
<!-- 
<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style> -->
