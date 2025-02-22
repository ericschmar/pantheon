import { cn } from "./cn";

const Button = ({ children, onClick, ...props }) => {
  return (
    <button
      className={cn(
        props.className,
        "group text-sm tracking-tight rounded-sm flex gap-2 items-center justify-center text-nowrap border transition-colors duration-75 fv-style disabled:opacity-50 disabled:cursor-not-allowed bg-accent-blue border-transparent text-white [box-shadow:hsl(219,_93%,_30%)_0_-2px_0_0_inset,_hsl(219,_93%,_95%)_0_1px_3px_0] dark:[box-shadow:hsl(219,_93%,_30%)_0_-2px_0_0_inset,_hsl(0,_0%,_0%,_0.4)_0_1px_3px_0] hover:bg-[hsl(219,_93%,_35%)] active:[box-shadow:none] hover:[box-shadow:none] dark:hover:[box-shadow:none] h-9 pl-2.5 pr-3 data-kbd:pr-1.5 w-full sm:w-fit cursor-pointer"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
