import { ReactNode } from 'react';
import Brackets from './brackets';

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  showBrackets?: boolean;
  iconOnly?: boolean;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  intent?: 'primary' | 'ghost';
  ariaExpanded?: boolean;
  rawChildren?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({
  children,
  icon,
  onClick,
  className = '',
  showBrackets = true,
  iconOnly = false,
  ariaLabel,
  size = 'md',
  intent = 'primary',
  ariaExpanded,
  rawChildren = false,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseClasses = 'flex items-center border transition-colors';
  const sizeClasses = size === 'sm' ? 'h-8 text-[11px]' : 'h-10 text-xs';
  const layoutClasses = iconOnly
    ? 'justify-center gap-0 px-0 aspect-square'
    : rawChildren
      ? 'w-full gap-0'
      : 'gap-x-2 px-0';
  const borderColor = intent === 'ghost' ? 'border-gray-800' : 'border-gray-400';
  const hoverClass = intent === 'ghost' ? 'hover:bg-white/5' : 'hover:bg-white/10';

  const buttonClassList = [
    baseClasses,
    sizeClasses,
    layoutClasses,
    borderColor,
    hoverClass,
    className,
  ];

  if (icon && !iconOnly) {
    buttonClassList.push('pl-0');
  }

  const buttonClasses = buttonClassList.join(' ').trim();

  const iconWrapperClasses = iconOnly
    ? 'flex h-full aspect-square items-center justify-center'
    : rawChildren
      ? 'bg-white/10 h-full aspect-square flex items-center justify-center'
      : 'bg-white/10 h-full aspect-square flex items-center justify-center px-2';

  const labelForScreenReaders = ariaLabel ?? (typeof children === 'string' ? children : undefined);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={buttonClasses}
        aria-label={iconOnly ? labelForScreenReaders : ariaLabel}
        aria-expanded={ariaExpanded}
        type={type}
        disabled={disabled}
      >
        {icon && <span className={iconWrapperClasses}>{icon}</span>}
        {iconOnly ? (
          <span className="sr-only">{labelForScreenReaders ?? 'Button'}</span>
        ) : rawChildren ? (
          <span className="flex-1">{children}</span>
        ) : (
          <span className={`uppercase text-xs flex-1 text-center ${icon ? 'pr-2' : 'px-4'}`}>
            {children}
          </span>
        )}
      </button>
      <div className={showBrackets ? 'opacity-100' : 'opacity-0'}>
        <Brackets />
      </div>
    </div>
  );
}
