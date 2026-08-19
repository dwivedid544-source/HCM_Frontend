import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

const variantClasses = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 active:scale-95',
  secondary: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95',
  outline: 'bg-transparent text-primary-600 dark:text-primary-400 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 active:scale-95',
  ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-95',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95',
  ai: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 active:scale-95',
  export: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95',
  import: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95'
};

const sizeClasses = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-xs sm:text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2.5'
};

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ariaLabel,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const Icon = leftIcon;
  const RightIcon = rightIcon;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={cn(
        'whitespace-nowrap shrink-0 flex items-center justify-center font-bold rounded-xl transition-all duration-150 select-none cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
      {!isLoading && RightIcon && (
        <RightIcon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
