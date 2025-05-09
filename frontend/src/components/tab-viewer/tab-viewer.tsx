import { tabState } from '@/state/tab-state';
import { useValtio } from 'use-valtio';
import { TabProps } from '@/types/tab';
import { X } from 'lucide-react';
import { cn } from '@/components/cn';
import Attribute from '../attribute';
import _ from 'lodash';
import { useEffect, useState } from 'react';

const TabViewer = () => {
  const { tabs, selectedTabId, selectedTab } = useValtio(tabState);

  const [currentAttrs, setCurrentAttrs] = useState<{
    [key: string]: string[];
  } | null>(null);

  useEffect(() => {
    const attrs = selectedTab?.data?.attrs as { [key: string]: string[] };
    setCurrentAttrs(attrs);
  }, [selectedTab]);

  const Tab = ({ text, dismissable, selected, onClick, onClose }: TabProps) => {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex flex-row gap-1 flex-nowrap items-center min-w-4 max-w-8 cursor-pointer pl-2 pr-2 pt-1 pb-1 rounded-sm bg-white/60 border default-border-color',
          selected
            ? 'dark:bg-offgray-800/8 shadow-[3px_3px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[3px_3px_0_hsla(219,_90%,_60%,_0.08)]'
            : '',
        )}
      >
        <p className="tracking-tight text-nowrap text-ellipsis text-xs">
          {text}
        </p>
        {dismissable && <X onClick={() => onClose()} size={13} />}
      </div>
    );
  };

  return (
    <div
      className={cn('flex flex-col h-full', tabs.length > 0 ? ' gap-1' : '')}
    >
      <div className="flex gap-1 flex-row flex-nowrap">
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            text={tab.title}
            dismissable={selectedTabId === idx && tab.id !== '1'}
            selected={idx === selectedTabId}
            onClick={() => tabState.setSelectedTabId(idx)}
            onClose={() => tabState.deleteTab(idx)}
          />
        ))}
      </div>

      <div
        className={cn(
          'w-[98%] border default-border-color rounded-sm bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]',
          'flex flex-col',
          tabs.length > 0 ? 'h-[92%]' : 'h-full',
        )}
      >
        <div className="relative flex w-full h-full flex-col flex-none justify-between">
          <div className="mt-5 flex w-full items-center justify-center">
            {/* padding on header */}
            <hr className="w-full max-w-full border-t  grid-border-color"></hr>
          </div>
          <div className="mx-auto w-[350px] grow border-r border-l grid-border-color overflow-y-auto overflow-x-hidden">
            {_.map(_.keys(currentAttrs), (key: string) => (
              <Attribute
                key={key}
                name={key}
                value={
                  tabs[selectedTabId]?.data?.attrs[key] as string | string[]
                }
              />
            ))}
          </div>
          <div className="mb-5 flex w-full items-center justify-center">
            <hr className="w-full max-w-full border-t grid-border-color"></hr>
            {/* padding on footer */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabViewer;
