<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { modal, FormModal } from '$lib/components/modal'

  import SuperSelect from '$lib/components/input/Select.svelte'
  import {
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table'
  import Datatable from '$components/table/Datatable.svelte'
  import {
    type TableState,
    getParams,
    EditRowButton,
    EditRowInput,
    RowActions,
  } from '$lib/components/table'
  import type { RouterOutputs, RouterInputs } from '$trpc/router'
  import { goto } from '$app/navigation'
  import EditRowCurrency from '$lib/components/table/EditRowCurrency.svelte'
  import { createRawSnippet } from 'svelte';
  import SimpleSelect from './SimpleSelect.svelte'
  import UsedCredits from './UsedCredits.svelte'


  type Customer = RouterOutputs['customer']['getPaginatedCustomers']['rows'][0]

  const columns: ColumnDef<Customer>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'name',
          editT: 'text',
          value: info.getValue(),
        }),
      footer: info => info.column.id,
    },
    {
      header: 'CPF/CNPJ',
      accessorKey: 'cpf_cnpj',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'cpf_cnpj',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'Tipo Cliente',
      accessorKey: 'is_retail',
      cell: info =>
        renderComponent(SimpleSelect, {
          id: info.row.original.id,
          colID: 'is_retail',
          value: info.getValue(),
          options: [
            {
              label: 'Pessoa Juridica',
              value: false,
            },
            {
              label: 'Pessoa Fisica',
              value: true,
            },
          ],
        }),
    },
    {
      header: 'RG/IE',
      accessorKey: 'rg_ie',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'rg_ie',
          editT: 'text',
          value: info.getValue(),
        }),
    },

    {
      // accessorFn: row => row.description,
      header: () => 'Email',
      accessorKey: 'email',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'email',
          editT: 'text',
          value: info.getValue(),
        }),
      footer: info => info.column.id,
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'phone',
          editT: 'text',
          value: info.getValue(),
        }),
    },
    {
      header: 'Cell Phone',
      accessorKey: 'cellphone',
      cell: info =>
        renderComponent(EditRowInput<Customer>, {
          id: info.row.original.id,
          colID: 'cellphone',
          editT: 'text',
          value: info.getValue(),
        }),
    },

    {
      header: 'Used Credit',
      accessorKey: 'used_credit',
      cell: info =>
        renderComponent(UsedCredits, {
          id: info.row.original.id,
          value: info.getValue(),
        }),
    },
    {
      header: 'Max Credit',
      accessorKey: 'max_credit',
      cell: info =>
        renderComponent(EditRowCurrency<Customer>, {
          id: info.row.original.id,
          colID: 'max_credit',
          editT: 'number',
          value: info.getValue(),
        }),
    },

    {
      id: 'edit',
      header: () => 'Edit',
      cell: info =>
        renderComponent(EditRowButton<Customer>, {
          row: info.row.original,
        }),
      // footer: info => info.column.id,
    },
    {
      id: 'actions',
      header: () => 'Actions',
      cell: info =>
        renderComponent(RowActions, {
          actions: [
            {
              name: 'View Details',
              fn: () => {
                goto(`/admin/customer/${info.row.original.id}`)
              },
            },
          ],
        }),
    },
  ]

  async function load(s: TableState) {
    const resp = await trpc($page).customer.getPaginatedCustomers.query(s)

    return {
      data: resp.rows ?? [],
      count: resp.total ?? 0,
    }
  }

  async function save(changes: { [key: string]: Customer }) {
    for (const key in changes) {
      try {
        const resp = await trpc($page).customer.updateCustomer.mutate({
          id: Number(key),
          customer: {
            cellphone: changes[key].cellphone ?? undefined,
            max_credit: changes[key].max_credit,
            phone: changes[key].phone ?? undefined,
            name: changes[key].name,
            email: changes[key].email ?? undefined,
            is_retail: changes[key].is_retail ?? undefined
          },
        })

        if (resp) {
          toast.success(`#${key} 'Cliente updated'`)
          window.location.reload()
        }
      } catch (error) {
        toast.error(`#${key} 'Cliente update failed'`)
      }
    }
    return {
      success: true,
    }
  }

  function add(invalidate: Function) {
    modal.open(FormModal<RouterInputs['customer']['insertCustomer']>, {
      title: 'Create new Customer',
      fields: [
        {
          name: 'is_retail',
          label: 'Pessoa Fisica',
          type: 'checkbox',
        },
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'Phone',
          name: 'phone',
          type: 'text',
        },
        {
          name: 'cellphone',
          label: 'CellPhone',
          type: 'text',
        },
        {
          label: 'Email',
          name: 'email',
          type: 'email',
        },
        {
          name: 'cpf_cnpj',
          label: 'CPF/CNPJ',
          type: 'text',
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).customer.insertCustomer.mutate(toSave)

          if (resp) {
            toast.success('Customer Created')
            invalidate()
          }
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
        invalidate()
      },
    })
  }
</script>

<div class=" h-[70vh] overflow-x-auto p-4">
  <Datatable columns={columns} {load} {save} {add} />
</div>
