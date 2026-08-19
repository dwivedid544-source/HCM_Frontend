import React from 'react';
import { cn } from '../../../utils/cn';

const PageHeader = ({
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <div className={cn("flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left", className)}>
      <div>
        <h1 className="hcm-page-title">{title}</h1>
        {subtitle && <p className="hcm-page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
