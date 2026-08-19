import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

const variantClasses = {
  ghost: 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
  primary: 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30',
  success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50',
  danger: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50',
  secondary: 'text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
};

const sizeClasses = {
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm',
  lg: 'w-11 h-11 rounded-xl text-base'
};

const IconButton = React.forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  ariaLabel,
  tooltip,
  onClick,
  className,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel || tooltip}
      title={tooltip || ariaLabel}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
        variantClasses[variant] || variantClasses.ghost,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      ) : null}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
