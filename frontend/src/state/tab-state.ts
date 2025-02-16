import { Tab } from "@/types/tab";
import { proxy } from "valtio";

export const state = proxy({
  tabs: [] as Tab[],
  selectedTabId: 0,
  setSelectedTabId: (id: number) => {
    state.selectedTabId = id;
  },
  deleteTab: (idx: number) => {
    state.tabs.splice(idx, 1);
    state.selectedTabId = state.tabs.length - 1;
    console.log("set selectedTabId", state.selectedTabId);
  },
  addTab: (tab: Tab) => {
    state.tabs.push(tab);
    state.selectedTabId = state.tabs.length - 1;
  },
});
