import { cn } from '@/components/cn';
import { useEffect, useState } from 'react';
import classes from './styles.module.css';

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

  useEffect(() => {
    console.log('use effect', isActive);
  }, [isActive]);

  return (
    <button
      className={
        isActive
          ? 'pb-0 ' + classes['button-outer']
          : 'pb-1 ' + classes['button-outer']
      }
      onClick={() => {
        setIsActive(!isActive);
        onClick?.();
      }}
    >
      <div className={cn(classes['button-inner'], classes['is-icon'])}>
        <div className={classes['button-icons.wrapper']}>
          <div
            className={classes['button-icon-wrapper']}
            data-active={isActive}
          >
            {children}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ToggleButton;
