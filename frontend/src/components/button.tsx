import { cn } from "@/components/cn";

const Button = ({
  variant,
  children,
  onClick,
  ...props
}: {
  variant: "active" | "light";
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const styles = {
    active:
      "bg-accent-blue text-white [box-shadow:hsl(219,_93%,_30%)_0_-2px_0_0_inset,_hsl(219,_93%,_95%)_0_1px_3px_0] dark:[box-shadow:hsl(219,_93%,_30%)_0_-2px_0_0_inset,_hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-[hsl(219,_93%,_35%)]",
    light:
      "text-black dark:text-offgray-50 border-offgray-200/50 dark:border-offgray-400/20 bg-offgray-50/60 dark:bg-offgray-300/5 hover:bg-offgray-100/50 dark:hover:bg-offgray-200/10 [box-shadow:hsl(218,_13%,_50%,_0.1)_0_-2px_0_0_inset] dark:[box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset]",
  };
  return (
    <button
      className={cn(
        props.className,
        styles[variant],
        "group text-sm rounded-sm flex gap-2 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed border-transparent active:[box-shadow:none] hover:[box-shadow:none] dark:hover:[box-shadow:none] h-9 pl-2.5 pr-3 data-kbd:pr-1.5 w-full sm:w-fit cursor-pointer"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
