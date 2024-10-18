<script lang="ts">
    export let date:Date
    import { format } from 'date-fns';
</script>

{format(date,'dd/MM/yyyy')}