import { ReactNode } from 'react';
import Brackets from './brackets';

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  showBrackets?: boolean;
}

export function Button({
  children,
  icon,
  onClick,
  className = '',
  showBrackets = true,
}: ButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex w-full items-center border border-gray-400 h-10 gap-x-2 hover:bg-white/10 transition-colors ${className}`}
      >
        {icon && (
          <span className="bg-white/10 h-full aspect-square flex items-center justify-center px-2">
            {icon}
          </span>
        )}
        <span className={`uppercase text-xs ${icon ? 'pr-2' : 'px-4'}`}>{children}</span>
      </button>
      <div className={showBrackets ? 'opacity-100' : 'opacity-0'}>
        <Brackets />
      </div>
    </div>
  );
}
