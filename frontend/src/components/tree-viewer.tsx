import { useEffect, useState, useTransition } from "react";
import { GetEntries } from "../lib/wailsjs/go/main/App";
import { tree } from "@/lib/wailsjs/go/models";
import { cn } from "./cn";
import { proxy } from "valtio";
import { useValtio } from "use-valtio";
import { SquareMinus, SquarePlus } from "lucide-react";
import { state as tabState } from "@/state/tab-state";

const state = proxy({
  openedNodeIds: [] as string[],
  addSelectedNodeId: (id: string) => {
    state.openedNodeIds = [...state.openedNodeIds, id];
  },
  removeSelectedNodeId: (id: string) => {
    state.openedNodeIds = state.openedNodeIds.filter((nodeId) => nodeId !== id);
  },
  isOpened: (id: string) => state.openedNodeIds.includes(id),
});

function TreeView() {
  const [loading, startTransition] = useTransition();
  const [entries, setEntries] = useState<tree.Tree>({} as tree.Tree);
  const { openedNodeIds, addSelectedNodeId, removeSelectedNodeId, isOpened } =
    useValtio(state);

  const { contains, addTab } = useValtio(tabState);

  useEffect(() => {
    startTransition(async () => {
      const t = await GetEntries();
      console.log(t);
      setEntries(t);
    });
  }, []);

  const ListComponent = ({ root }: { root: tree.TreeNode | undefined }) => {
    const { addSelectedNodeId, removeSelectedNodeId, isOpened } =
      useValtio(state);
    const { contains, addTab } = useValtio(tabState);

    if (!root) return null;
    const children = root.children || [];
    const entry = root.entry;
    const childName = entry?.dn.split(",")[0] ?? "";
    const qualifier = childName.split("=")[0];
    const value = root.id.split("=")[1] ?? "";
    return (
      <>
        <li className="w-full flex flex-1 leading-[18px]">
          <a
            onClick={() => {
              console.log(root.id, isOpened(root.id));
              isOpened(root.id)
                ? removeSelectedNodeId(root.id)
                : addSelectedNodeId(root.id);
              if (root.children && root.children.length === 0) {
                addTab({
                  id: root.id,
                  title: value,
                  data: root.entry ?? ({} as tree.LDAPEntry),
                });
              }
            }}
            className={cn(
              contains(root.id)
                ? "text-accent-blue bg-accent-blue/5 dark:text-blue-400 dark:bg-accent-blue/12 "
                : "",
              "flex flex-row place-content-between items-center ",
              "lg:px-2.5 lg:py-1 fv-style w-full shrink-0 lg:text-left text-nowrap focus-visible:[outline-offset:-4px]! dark:border-gray-700/20 hover:bg-accent-blue/10 cursor-pointer"
            )}
          >
            <div className="flex flex-row gap-2">
              {value}
              <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                {qualifier}
              </kbd>
            </div>

            {root.children &&
              root.children.length > 0 &&
              (isOpened(root.id) ? (
                <SquareMinus size={14} className="stroke-gray-500" />
              ) : (
                <SquarePlus size={14} className="stroke-gray-500" />
              ))}
          </a>
        </li>
        {root.children && root.children.length > 0 && isOpened(root.id) && (
          <ul className="overflow-x-auto flex lg:flex-col text-sm pl-4">
            {children.map((childNode) => (
              <ListComponent key={childNode.id} root={childNode} />
            ))}
          </ul>
        )}
      </>
    );
  };

  return loading ? (
    <></>
  ) : (
    <nav className="hidden md:block relative z-1 h-[91%] border-l border-gray-300 dark:border-gray-700/20 overflow-y-auto">
      <div className="subheader text-center lg:text-left px-0 lg:px-2.5 pb-2.5">
        {`Root <${entries?.Root?.id}>`}
      </div>
      <ul className="overflow-x-auto flex lg:flex-col text-sm">
        {entries.Root?.children.map((entry) => (
          <ListComponent key={entry.id} root={entry} />
        ))}
      </ul>
    </nav>
  );
}

export default TreeView;
