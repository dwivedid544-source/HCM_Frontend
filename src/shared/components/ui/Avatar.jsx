import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../../utils/cn';

const Avatar = ({ src, alt, className, iconClassName }) => {
  const isImageValid = src && typeof src === 'string' && src.trim() !== '';

  if (isImageValid) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div className={cn('flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500', className)}>
      <User className={cn('w-1/2 h-1/2', iconClassName)} />
    </div>
  );
};

export default Avatar;
