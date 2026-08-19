import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendPct,
  growth,
  color,
  iconColor,
  bg,
  text,
  style,
  progress,
  total,
  onClick,
  className,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className={cn("card p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse", className)}>
        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4" />
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  // Handle compatibility with SuperAdmin style object
  const finalBg = bg || style?.bg || 'bg-primary-50 dark:bg-primary-950/20';
  const finalIconColor = iconColor || color || style?.text || style?.color || 'text-primary-600 dark:text-primary-400';
  const badgeGrowth = trendPct || growth || style?.growth;
  const cardSub = sub || trend || style?.sub;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "card p-5 sm:p-6 group relative overflow-hidden transition-all duration-300",
        onClick && "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      {style?.color && style.color.includes('gradient') && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.color}`} />
      )}

      <div className="flex items-center justify-between gap-3 mb-3">
        {Icon && (
          <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center", finalBg, finalIconColor)}>
            <Icon size={22} />
          </div>
        )}
        
        {badgeGrowth && (
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full ml-auto">
            {badgeGrowth}
          </span>
        )}
      </div>

      <div className="text-left">
        <p className="card-title mb-1">{label}</p>
        <h3 className="card-value truncate" title={typeof value === 'string' ? value : undefined}>
          {value}
        </h3>
        
        {cardSub && (
          <p className="card-desc mt-1.5 line-clamp-1">{cardSub}</p>
        )}

        {/* Optional Progress Bar (e.g. Leave balances, Goal bars) */}
        {progress !== undefined && total !== undefined && total > 0 && (
          <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, (progress / total) * 100))}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full bg-primary-600 dark:bg-primary-500", finalIconColor.replace('text-', 'bg-'))}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
