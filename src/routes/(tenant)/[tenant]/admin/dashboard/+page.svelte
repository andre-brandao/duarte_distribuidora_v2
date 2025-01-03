<script lang="ts">
  import { DashboardPage } from '$lib/components/dashboard/admin'

  // import DashboardPage from '$lib/components/dashboard/dashboard.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<DashboardPage distribuidoras={data.distribuidoras} />
