import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = true, size = 'md' }) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  let barColor = 'from-indigo-500 to-indigo-600';
  if (clampedProgress === 100) {
    barColor = 'from-emerald-500 to-teal-500';
  } else if (clampedProgress < 30) {
    barColor = 'from-amber-500 to-orange-500';
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
