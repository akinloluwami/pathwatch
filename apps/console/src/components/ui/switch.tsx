import { ComponentPropsWithoutRef, forwardRef } from 'react';

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'onChange'>;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, disabled = false, ...props }, ref) => {
    const baseClasses =
      'relative inline-flex h-5 w-9 items-center rounded-full border border-gray-700 transition';
    const stateClasses = checked ? 'bg-[#f45817]' : 'bg-black/60';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#f45817]';
    const thumbPosition = checked ? 'translate-x-4' : 'translate-x-1';

    return (
      <button
        ref={ref}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={[baseClasses, stateClasses, disabledClasses].join(' ')}
        {...props}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            thumbPosition,
          ].join(' ')}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
