<script lang="ts">
  import { icons } from '$lib/utils/icons'

  import { modal } from '$lib/components/modal'
  import BugReportModal from '$lib/components/modal/BugReportModal.svelte'
  import * as m from '$msgs'

  import {
    languageTag,
  } from '$lib/paraglide/runtime'

  import { page } from '$app/stores'

  import { getUserContext } from '$lib/stores/user'

  const user = getUserContext()

  type NavItem = {
    name: string
    href?: string
    subItems?: NavItem[]
    icon?: string
  }
  export let showDefaultItems = true

  export let navItems: NavItem[] = [
    {
      name: 'Cliente',
      icon: icons.warning(),
      href: '/testing',
      subItems: [
        {
          name: 'Cardapio',
          href: '/products',
        },
      ],
    },
  ]

  if ($user?.role === 'admin' && showDefaultItems) {
    navItems.push({
      name: 'Pessoas',
      href: '/admin',
      subItems: [
        // {
        //   name: m.products(),
        //   href: '/admin/products',
        //   // icon: icons.cube(),
        // },
        {
          name: m.usuarios(),
          href: '/admin/users',
          // icon: icons.users(),
        },
        {
          name: m.customers(),
          href: '/admin/customer',
          // icon: icons.users(),
        },
        // {
        //   name: 'Financeiro',
        //   href: '/admin/finance',
        // },
        // {
        //   name: m.stock(),
        //   href: '/admin/stock',
        // },
        {
          name: 'Fornecedor',
          href: '/admin/supplier',
        },
        // {
        //   name: 'Caixa',
        //   href: '/admin/cashier',
        // },
      ],
    },
    
    {
        name: 'Pedidos',
        href: '',
        subItems: [
          {
            name: 'Todos pedidos',
            href: '/admin/orders/allorders',
          },
          {
            name: m.orders(),
            href: '/admin/orders',
          },
          {
            name: 'Pedidos fiado',
            href: '/admin/finance',
          },
        ],
      },
      {
        name: 'Produtos',
        href: '',
        subItems: [
          {
            name: 'Produtos',
            href: '/admin/products',
          },
          {
            name:'Estoque',
            href: '/admin/stock',
          },
        ],
      },
      {
          name: 'Caixa',
          href: '/admin/cashier',
        },
    )
  }

  function isActive(href?: string) {
    return (
      $page.url.pathname === href ||
      $page.url.pathname === '/' + languageTag() + href ||
      ($page.url.pathname === '/' + languageTag() && href === '/')
    )
  }
</script>

{#each navItems as navItem, i (i)}

  {@const { name, icon } = navItem}
  <li>
    {#if navItem.subItems}
      <details>
        <summary>
          <!-- {#if typeof navItem.icon === 'string'}
            {@html icon}
          {/if} -->
          {name}
        </summary>
        <ul>
          {#each navItem.subItems as subItem, i (subItem.href)}
       
              <li>
                <a
                  href={subItem.href}
                  aria-current={isActive(subItem.href) ? 'page' : undefined}
                  class:active={isActive(subItem.href)}
                >
                  <!-- {#if typeof navItem.icon === 'string'}
                    {@html icon}
                  {/if} -->

                  {subItem.name}
                </a>
              </li>
          {/each}
        </ul>
      </details>
    {:else}
      <a
        href={navItem.href}
        aria-current={isActive(navItem.href) ? 'page' : undefined}
        class:active={isActive(navItem.href)}
      >
        <!-- {#if typeof navItem.icon === 'string'}
          {@html icon}
        {/if} -->
        {name}
      </a>
    {/if}
  </li>
{/each}

{#if showDefaultItems}
  <li>
    <button class="" onclick={() => modal.open(BugReportModal)}>
      {@html icons.bug()}
      Reportar Bug
    </button>
  </li>
{/if}

<style>
  a[aria-current='page']::before {
    view-transition-name: active-page;
    content: '●';
  }
</style>
