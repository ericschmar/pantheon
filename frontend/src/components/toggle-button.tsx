import { cn } from "@/components/cn";
import { useEffect, useState } from "react";

const ToggleButton = ({
  active,
  children,
  onClick,
  ...props
}: {
  active?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const [isActive, setIsActive] = useState(active ?? false);

  useEffect(() => {
    active && setIsActive(active);
  }, [active, onClick]);

  return (
    <button
      className={cn(
        props.className,
        !isActive &&
          "text-black dark:text-offgray-50 border-offgray-200/50 dark:border-offgray-400/20 bg-offgray-50/60 dark:bg-offgray-300/5 [box-shadow:hsl(218,_13%,_50%,_0.1)_0_-2px_0_0_inset] dark:[box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset]",
        isActive &&
          "text-black dark:text-offgray-50 border-offgray-200/50 dark:border-offgray-400/20 bg-offgray-200/50 dark:bg-offgray-300/10",
        "group text-sm rounded-sm flex gap-2 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed border-transparent active:[box-shadow:none] h-9 pl-2.5 pr-3 data-kbd:pr-1.5 w-full sm:w-fit cursor-pointer"
      )}
      onClick={() => {
        setIsActive(!isActive);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
};

export default ToggleButton;
