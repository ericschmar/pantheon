<script lang="ts" module>
    // This is sample data.
    const data = {
        changes: [
            {
                file: "README.md",
                state: "M",
            },
            {
                file: "routes/+page.svelte",
                state: "U",
            },
            {
                file: "routes/+layout.svelte",
                state: "M",
            },
        ],
        tree: [
            ["lib", ["components", "button.svelte", "card.svelte"], "utils.ts"],
            [
                "routes",
                ["hello", "+page.svelte", "+page.ts"],
                "+page.svelte",
                "+page.server.ts",
                "+layout.svelte",
            ],
            ["static", "favicon.ico", "svelte.svg"],
            "eslint.config.js",
            ".gitignore",
            "svelte.config.js",
            "tailwind.config.js",
            "package.json",
            "README.md",
        ],
    };
</script>

<script lang="ts">
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import File from "lucide-svelte/icons/file";
    import Command from "lucide-svelte/icons/Command";
    import AudioWaveform from "lucide-svelte/icons/audio-waveform";
    import Folder from "lucide-svelte/icons/folder";
    import type { ComponentProps } from "svelte";
    import ConnectionSwitcher from "./connection-switcher.svelte";
    import { onMount } from "svelte";
    import { GetEntries } from "$lib/wailsjs/go/main/App";
    import { type Tree, type TreeReturn } from "$lib/types/Tree";

    let entries: { key: string; value: Tree }[] = $state([]);

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

    let {
        ref = $bindable(null),
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
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
    <Sidebar.Rail />
</Sidebar.Root>

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
