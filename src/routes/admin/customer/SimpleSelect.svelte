<script lang="ts">
  import type { SelectCustomer } from '$lib/server/db/schema'
  import { type EditableTypes, getRowChanges } from '$components/table'

  interface SelectTipoPessoaProps {
    value: SelectCustomer['is_retail']
    id: SelectCustomer['id']
  }

  const rowChanges = getRowChanges<SelectCustomer>()

  let rInEdit = $state(false)

  let changedRow = $state(<SelectCustomer>{})

  let {
    value,
    id
  }:SelectTipoPessoaProps = $props()
  $effect(()=>{
    if ($rowChanges[id]) {
      rInEdit = true
      changedRow = $rowChanges[id]
    } else {
      rInEdit = false
      changedRow = <SelectCustomer>{}
    }
  })
</script>

<!-- {#if rInEdit !== true}
  <span>
    {value ? 'Fisica':'Juridica'}
  </span>
{:else} -->
  <select class="select" bind:value={changedRow['is_retail']}>
    <option value={false}>Pessoa juridica</option>
    <option value={true}>Pessoa fisica</option>
  </select>
<!-- {/if} -->
