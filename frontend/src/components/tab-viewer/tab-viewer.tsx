import { state } from "@/state/tab-state";
import { useValtio } from "use-valtio";
import { TabProps } from "@/types/tab";
import { X } from "lucide-react";
import { cn } from "@/components/cn";

const TabViewer = () => {
  const { tabs, selectedTabId } = useValtio(state);

  const Tab = ({ text, dismissable, selected, onClick, onClose }: TabProps) => {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex flex-row gap-1 flex-nowrap items-center max-w-[8rem] cursor-pointer pl-2 pr-2 pt-1 pb-1 rounded-sm bg-white/60 border default-border-color",
          selected
            ? "dark:bg-offgray-800/8 shadow-[3px_3px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[3px_3px_0_hsla(219,_90%,_60%,_0.08)]"
            : ""
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
      className={cn(
        "flex flex-col h-full w-full",
        tabs.length > 0 ? " gap-1" : ""
      )}
    >
      <div className="flex gap-1 flex-row flex-nowrap">
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            text={tab.title}
            dismissable={selectedTabId === idx && tab.id !== "1"}
            selected={idx === selectedTabId}
            onClick={() => state.setSelectedTabId(idx)}
            onClose={() => state.deleteTab(idx)}
          />
        ))}
      </div>
      <div className="p-4 mb-4 w-[98%] h-full border default-border-color rounded-sm p-2.5 bg-white/60 dark:bg-offgray-800/8 shadow-[6px_6px_0_hsla(219,_93%,_42%,_0.06)] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.08)]">
        {tabs[selectedTabId]?.title}
      </div>
    </div>
  );
};

export default TabViewer;
