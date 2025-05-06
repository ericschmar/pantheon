import { tree } from '@/lib/wailsjs/go/models';
import { Tab } from '@/types/tab';
import { proxy } from 'valtio';

export const tabState = proxy({
  tabs: [] as Tab[],
  selectedTab: null as Tab | null,
  selectedTabId: 0,
  setSelectedTabId: (id: number) => {
    tabState.selectedTabId = id;
  },
  deleteTab: (idx: number) => {
    treeState.removeSelectedNodeId(tabState.tabs[idx].id);
    tabState.tabs.splice(idx, 1);
    tabState.setSelectedTabId(tabState.tabs.length - 2);
    tabState.tabs = [...tabState.tabs];
  },
  addTab: (tab: Tab) => {
    tabState.tabs.push(tab);
    tabState.tabs = [...tabState.tabs];
    tabState.setSelectedTabId(tabState.tabs.length - 1);
    tabState.selectedTab = tab;
    console.log(tabState);
  },
  contains: (tabId: string) => {
    return tabState.tabs.some((tab) => tab.id === tabId);
  },
});

export const treeState = proxy({
  entries: null as unknown as tree.Tree,
  openedNodeIds: [] as string[],
  hasMore: false,
  addSelectedNodeId: (id: string) => {
    treeState.openedNodeIds = [...treeState.openedNodeIds, id];
  },
  removeSelectedNodeId: (id: string) => {
    treeState.openedNodeIds = treeState.openedNodeIds.filter(
      (nodeId) => nodeId !== id,
    );
  },
  isOpened: (id: string) => treeState.openedNodeIds.includes(id),
  appendChildren: (id: string, children: tree.TreeNode[]) => {
    // Helper function to recursively find and update the node
    const updateNodeChildren = (node: tree.TreeNode): boolean => {
      // Check if current node is the target
      if (node.id === id) {
        // Initialize children array if it doesn't exist
        if (!node.children) {
          node.children = [];
        }
        // Append the new children
        node.children.push(...children);
        return true; // Node found and updated
      }

      // If node has children, recursively search them
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (updateNodeChildren(child)) {
            return true; // Node found in this branch
          }
        }
      }

      return false; // Node not found in this branch
    };

    // Start the recursive search from the root if it exists
    if (treeState.entries && treeState.entries.Root) {
      updateNodeChildren(treeState.entries.Root);
      // Trigger reactivity by reassigning entries
      treeState.entries = { ...treeState.entries } as tree.Tree;
    }
  },
});
