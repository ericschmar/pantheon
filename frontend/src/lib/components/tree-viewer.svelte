<script lang="ts">
    import type { Tree, TreeReturn } from "$lib/types/Tree";
    import { GetEntries } from "$lib/wailsjs/go/main/App";
    import { onMount } from "svelte";
    import { AutoObject, Element, Pane } from "svelte-tweakpane-ui";
    let entries: { key: string; value: Tree }[] = $state([]);

    onMount(async () => {
        let e = (await GetEntries()) as unknown as TreeReturn;
        console.log(e.Root.nodes);
        for (const node of e.Root.nodes) {
            entries.push({ key: node.name, value: node });
        }
    });
</script>

<Pane>
    {#each entries as entry, idx}
        <AutoObject bind:object={entries[idx]} />
    {/each}
</Pane>
