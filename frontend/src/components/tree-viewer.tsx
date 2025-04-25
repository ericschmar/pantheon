import { useEffect, useTransition } from 'react';
import {
  Disconnect,
  GetEntries,
  SearchOneLayer,
} from '../lib/wailsjs/go/main/App';
import { tree } from '@/lib/wailsjs/go/models';
import { cn } from './cn';
import { useValtio } from 'use-valtio';
import { Loader, SquareMinus, SquarePlus, Unplug } from 'lucide-react';
import { tabState, treeState } from '@/state/tab-state';
import { navigate } from 'wouter/use-hash-location';
import VirtualList from 'react-tiny-virtual-list';

function TreeView() {
  const [loading, startTransition] = useTransition();
  const { entries } = useValtio(treeState);

  useEffect(() => {
    startTransition(async () => {
      const t = await GetEntries();
      console.log(t);
      //const temp = t.Root?.children;
      //t.Root.children = [...temp, ...temp];
      treeState.entries = t;
    });
  }, []);

  const ListComponent = ({ root }: { root: tree.TreeNode | undefined }) => {
    const { addSelectedNodeId, removeSelectedNodeId, openedNodeIds } =
      useValtio(treeState);
    const { contains, addTab } = useValtio(tabState);
    const [loadingChildren, startLoadingChildrenTransition] = useTransition();

    const loadChildren = async () => {
      startLoadingChildrenTransition(async () => {
        const children = await SearchOneLayer(`${childName}`);
        treeState.appendChildren(childName, children.Root?.children || []);
      });
    };

    if (!root) return null;
    const children = root.children || [];
    const entry = root.entry;
    const childName = entry?.dn.split(',')[0] ?? '';
    const qualifier = childName.split('=')[0];
    const value = root.id.split('=')[1] ?? '';
    console.log(entry, childName, qualifier, value);
    return (
      <>
        <li className="w-full flex flex-1 leading-[18px]">
          <a
            onClick={() => {
              if (loadingChildren) return;
              openedNodeIds.includes(root.id)
                ? removeSelectedNodeId(root.id)
                : addSelectedNodeId(root.id);
              if (
                qualifier !== 'ou' &&
                root.children &&
                root.children.length === 0
              ) {
                addTab({
                  id: root.id,
                  title: value,
                  data: root.entry ?? ({} as tree.LDAPEntry),
                  selected: true,
                });
              } else {
                startLoadingChildrenTransition(async () => {
                  loadChildren();
                });
              }
            }}
            className={cn(
              contains(root.id)
                ? 'text-accent-blue bg-accent-blue/5 dark:text-blue-400 dark:bg-accent-blue/12 '
                : '',
              'flex flex-row place-content-between items-center ',
              'lg:px-2.5 lg:py-1 fv-style w-full shrink-0 lg:text-left text-nowrap focus-visible:[outline-offset:-4px]! dark:border-gray-700/20 hover:bg-accent-blue/10 cursor-pointer',
            )}
          >
            <div className="flex flex-row gap-2">
              <div className="text-xs">{value}</div>
              <kbd className="h-4 px-1.5 max-w-max rounded-xs flex items-center gap-0.5 text-[.5875rem] text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                {qualifier}
              </kbd>
            </div>

            {loadingChildren ? (
              <Loader size={14} className="stroke-gray-500 animate-spin" />
            ) : (
              qualifier === 'ou' &&
              (openedNodeIds.includes(root.id) ? (
                <SquareMinus size={14} className="stroke-gray-500" />
              ) : (
                <SquarePlus size={14} className="stroke-gray-500" />
              ))
            )}
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
          ? ''
          : 'border-l border-gray-300 dark:border-gray-700/20',
        'hidden md:block relative z-1 overflow-y-auto h-full',
      )}
    >
      {entries === null ? (
        <div className="flex flex-col items-center justify-center overflow-y-auto">
          <div className="text-sm text-gray-500 dark:text-gray-300">
            No Connection
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            <div className="flex flex-row gap-2">
              <kbd className="h-5 max-w-max rounded-xs flex items-center gap-0.5 text-[.6875rem] font-bold text-gray-500 dark:text-gray-300 border border-gray-500/20 dark:border-offgray-400/10 bg-gray-50/50 dark:bg-cream-900/10 !px-1">
                Ctrl/Cmd + Shift + R
              </kbd>
              to refresh.
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {'Or File > Connect'}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-row gap-4 subheader text-center lg:text-left px-0 lg:px-2.5 pb-2.5">
            {`Root <${entries?.Root?.id}>`}
            <Unplug
              size={13}
              className="cursor-pointer"
              onClick={async () => {
                await Disconnect();
                navigate('/connect');
              }}
            />
          </div>
          <ul className="overflow-auto flex lg:flex-col text-sm">
            <VirtualList
              width="100%"
              height={600}
              itemCount={entries.Root?.children.length ?? 0}
              itemSize={50} // Also supports variable heights (array or function getter)
              renderItem={({ index, style }) => (
                <ListComponent
                  key={entries.Root?.children[index].id}
                  root={entries.Root?.children[index]}
                />
              )}
            />
          </ul>
        </>
      )}
    </nav>
  );
}

export default TreeView;
