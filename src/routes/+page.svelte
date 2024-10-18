<script>
  import SEO, { getSEOProps } from '$lib/components/SEO/index.svelte'

  import Carousel from '$lib/components/landing-page/Carousel.svelte'
  import Carousel2 from '$lib/components/landing-page/Carousel2.svelte'
  import Features3 from '$lib/components/landing-page/features/Features3.svelte'
  import Pricing from '$lib/components/landing-page/pricing/Pricing.svelte'
  import Features4 from '$lib/components/landing-page/features/Features4.svelte'
  import Footer from '$lib/components/landing-page/Footer.svelte'

  import ShareButton from '$components/share/index.svelte'
  import HeroDuarte from '$lib/components/landing-page/hero/HeroDuarte.svelte'
  //TODO: Adicionar SEO em todas outras paginas

  const routes = [
    {
      name: 'Cliente',
      paths: [{ name: 'Cardapio', link: '/products' }],
    },
    {
      name: 'Pessoas',
      paths: [
        { name: 'Usuarios', link: '/admin/users' },
        { name: 'Clientes', link: '/admin/customer' },
        { name: 'Fornecedores', link: '/admin/supplier' },
      ],
    },
    {
      name: 'Pedidos',
      paths: [
        { name: 'Todos pedidos', link: '/admin/orders/allorders' },
        { name: 'Pedidos', link: '/admin/orders' },
        { name: 'Pedidos fiado', link: '/admin/finance' },
        { name: 'Pedidos delivery', link: '/admin/orders/delivery' },
      ],
    },
    {
      name: 'Produtos',
      paths: [
        { name: 'Produtos', link: '/admin/products' },
        { name: 'Estoque', link: '/admin/stock' },
      ],
    },
  ]
</script>

<SEO
  {...getSEOProps({
    title: 'Home',
    featuredImage: {
      url: 'https://via.placeholder.com/672x448',
      alt: 'Placeholder image',
      width: 672,
      height: 448,
      caption: 'Home page',
    },
  })}
/>
<!-- <main class="flex-1 p-10">
  <div class="mb-8 text-2xl font-bold">Welcome to the Admin Panel</div>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each routes as route}
      <div class="collapse bg-base-200">
        <input type="checkbox" class="peer" />
        <div
          class="bg-base p-3 text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"
        >
          {route.name}
        </div>
        <div
          class=" bg-base text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"
        >
          <div class="mx-3 mb-3 flex gap-2 overflow-y-auto">
            {#each route.paths as path}
              <a class="btn btn-primary" href={path.link}>{path.name}</a>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</main> -->

<!-- <Modal onClose={console.log} onOpen={console.log}>Teste Modal</Modal> -->
<main class="flex flex-col gap-5 overflow-auto">
  <HeroDuarte />

  <!-- <div class="h-60 w-60">
    <RotatingGlobe></RotatingGlobe>
  </div> -->
  <!-- <ShareButton title="Home" url="https://example.com" /> -->

  <!-- <MapContact /> -->

  <!-- <Features3></Features3>

  <Pricing />

  <Features4></Features4>

  <Carousel />

  <Carousel2 />

  <Footer></Footer> -->
</main>
