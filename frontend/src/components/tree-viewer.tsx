import { useEffect, useState, useTransition } from "react";
import { GetEntries } from "../lib/wailsjs/go/main/App";
import { enums, tree } from "@/lib/wailsjs/go/models";
import { cn } from "./cn";
import { useValtio } from "use-valtio";
import { SquareMinus, SquarePlus } from "lucide-react";
import { tabState, treeState } from "@/state/tab-state";
import { EventsOn } from "@/lib/wailsjs/runtime/runtime";
import clsx from "clsx";

function TreeView() {
  const [loading, startTransition] = useTransition();
  const [entries, setEntries] = useState<tree.Tree>(
    null as unknown as tree.Tree
  );

  useEffect(() => {
    EventsOn("connected", (data) => {
      console.log(enums.EventType.CONNECTED, data);
      startTransition(async () => {
        const t = await GetEntries();
        console.log(t);
        setEntries(t);
      });
    });
  }, []);

  const ListComponent = ({ root }: { root: tree.TreeNode | undefined }) => {
    const { addSelectedNodeId, removeSelectedNodeId, openedNodeIds } =
      useValtio(treeState);
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
              console.log(root.id, openedNodeIds.includes(root.id));
              openedNodeIds.includes(root.id)
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
              <kbd className="h-4 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.5875rem] text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                {qualifier}
              </kbd>
            </div>

            {root.children &&
              root.children.length > 0 &&
              (openedNodeIds.includes(root.id) ? (
                <SquareMinus size={14} className="stroke-gray-500" />
              ) : (
                <SquarePlus size={14} className="stroke-gray-500" />
              ))}
          </a>
        </li>
        {root.children &&
          root.children.length > 0 &&
          openedNodeIds.includes(root.id) && (
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
    <nav
      className={cn(
        entries === null
          ? ""
          : "border-l border-gray-300 dark:border-gray-700/20",
        "hidden md:block relative z-1 h-[91%]  overflow-y-auto"
      )}
    >
      {entries === null ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-sm text-gray-500 dark:text-gray-300">
            No Connection
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            <div className="flex flex-row gap-2">
              <kbd className="h-5 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                Ctrl/Cmd + Shift + R
              </kbd>
              to refresh.
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {"Or File > Connect"}
          </div>
        </div>
      ) : (
        <>
          <div className="subheader text-center lg:text-left px-0 lg:px-2.5 pb-2.5">
            {`Root <${entries?.Root?.id}>`}
          </div>
          <ul className="overflow-x-auto flex lg:flex-col text-sm">
            {entries.Root?.children.map((entry) => (
              <ListComponent key={entry.id} root={entry} />
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}

export default TreeView;
