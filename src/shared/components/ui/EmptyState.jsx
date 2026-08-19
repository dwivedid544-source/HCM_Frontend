import React from 'react';
import { FileSearch } from 'lucide-react';
import { cn } from '../../../utils/cn';

const EmptyState = ({
  icon: Icon = FileSearch,
  title = "No records found",
  description = "There are no matching items for the selected criteria.",
  action,
  className
}) => {
  return (
    <div className={cn("py-16 px-4 text-center flex flex-col items-center justify-center opacity-60", className)}>
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 text-slate-400 dark:text-slate-500">
        <Icon size={40} />
      </div>
      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">{title}</h4>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
