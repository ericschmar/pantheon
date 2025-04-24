import { cn } from './cn';

const TextInput = ({
  value,
  label,
  onChange,
  placeholder,
  isPassword,
  ...props
}: {
  value?: string;
  label?: string;
  placeholder?: string;
  isPassword?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => {
  return (
    <div className="relative flex h-9 w-full sm:text-sm shadow-xs dark:shadow-black rounded-sm">
      <span className="text-xs shrink-0 inline-flex items-center rounded-l px-3 border border-gray-300 dark:border-gray-400/20">
        {label ? label : 'label'}
      </span>
      <input
        type={isPassword ? 'password' : 'text'}
        className={cn(
          props.className,
          value ? '' : 'text-gray-400',
          'text-xs pl-4 pr-8 shadow-none w-full fv-style rounded-r bg-white dark:bg-[hsl(218,_13%,_10%)] dark:text-white border border-l-0 border-gray-300 dark:border-gray-400/20 placeholder:italic placeholder:opacity-90 dark:placeholder:opacity-40',
        )}
        value={value ? value : ''}
        onChange={(v) => onChange?.(v)}
        {...props}
      />
    </div>
  );
};

export default TextInput;
