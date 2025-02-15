<script lang="ts">
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import File from "lucide-svelte/icons/file";
    import Folder from "lucide-svelte/icons/folder";
    import * as Resizable from "$lib/components/ui/resizable/index.js";
    import { type Tree, type TreeReturn } from "$lib/types/Tree";
    import { onMount } from "svelte";
    import { GetEntries } from "$lib/wailsjs/go/main/App";
    import ConnectionSwitcher from "./connection-switcher.svelte";
    import Command from "lucide-svelte/icons/Command";
    import AudioWaveform from "lucide-svelte/icons/audio-waveform";

    let entries: { key: string; value: Tree }[] = $state([]);
    let sidebar_width = $state(25);

    onMount(async () => {
        let e = (await GetEntries()) as unknown as TreeReturn;
        console.log(e.Root.nodes);
        for (const node of e.Root.nodes) {
            entries.push({ key: node.name, value: node });
        }
    });

    const teams = [
        {
            name: "Acme Inc",
            logo: Command,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ];
</script>

<Sidebar.Provider>
    <Resizable.PaneGroup direction="horizontal">
        <Resizable.Pane
            defaultSize={25}
            onResize={(event) => {
                sidebar_width = event;
            }}
        >
            <Sidebar.Root bind:size={sidebar_width}>
                <Sidebar.Header>
                    <ConnectionSwitcher {teams} />
                </Sidebar.Header>
                <Sidebar.Content>
                    <Sidebar.Group>
                        <Sidebar.GroupLabel>Files</Sidebar.GroupLabel>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu>
                                {#each entries as item, index (index)}
                                    {@render Tree({ ...item })}
                                {/each}
                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                    </Sidebar.Group>
                </Sidebar.Content>
            </Sidebar.Root>
        </Resizable.Pane>
        <Resizable.Handle withHandle />
        <Resizable.Pane><Sidebar.Inset></Sidebar.Inset></Resizable.Pane>
    </Resizable.PaneGroup>
</Sidebar.Provider>

{#snippet Tree({ key, value }: { key: string; value: Tree })}
    {#if value.nodes.length === 0}
        <Sidebar.MenuButton class="data-[active=true]:bg-transparent">
            <File />
            {key}
        </Sidebar.MenuButton>
    {:else}
        <Sidebar.MenuItem>
            <Collapsible.Root
                class="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
            >
                <Collapsible.Trigger>
                    {#snippet child({ props })}
                        <Sidebar.MenuButton {...props}>
                            <ChevronRight className="transition-transform" />
                            <Folder />
                            {key}
                        </Sidebar.MenuButton>
                    {/snippet}
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <Sidebar.MenuSub>
                        {#each value.nodes as subItem, index (index)}
                            {@render Tree({
                                key: subItem.name,
                                value: subItem,
                            })}
                        {/each}
                    </Sidebar.MenuSub>
                </Collapsible.Content>
            </Collapsible.Root>
        </Sidebar.MenuItem>
    {/if}
{/snippet}
