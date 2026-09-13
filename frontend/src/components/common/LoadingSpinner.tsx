import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  size = 'md',
  fullHeight = false
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 ${fullHeight ? 'min-h-[400px]' : ''}`}>
      <Loader2 size={iconSize} className="animate-spin text-indigo-600 dark:text-indigo-400" />
      {message && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
};
