import { Tab } from "@/types/tab";
import { proxy } from "valtio";

export const tabState = proxy({
  tabs: [] as Tab[],
  selectedTabId: 0,
  setSelectedTabId: (id: number) => {
    tabState.selectedTabId = id;
  },
  deleteTab: (idx: number) => {
    treeState.removeSelectedNodeId(tabState.tabs[idx].id);
    tabState.tabs.splice(idx, 1);
    tabState.selectedTabId = tabState.tabs.length - 1;
    tabState.tabs = [...tabState.tabs];
  },
  addTab: (tab: Tab) => {
    tabState.tabs.push(tab);
    tabState.selectedTabId = tabState.tabs.length - 1;
  },
  contains: (tabId: string) => {
    return tabState.tabs.some((tab) => tab.id === tabId);
  },
});

export const treeState = proxy({
  openedNodeIds: [] as string[],
  addSelectedNodeId: (id: string) => {
    treeState.openedNodeIds = [...treeState.openedNodeIds, id];
  },
  removeSelectedNodeId: (id: string) => {
    treeState.openedNodeIds = treeState.openedNodeIds.filter(
      (nodeId) => nodeId !== id
    );
  },
  isOpened: (id: string) => treeState.openedNodeIds.includes(id),
});
