import React from 'react';

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (type === 'status') {
    switch (value) {
      case 'Completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40';
        break;
      case 'In Progress':
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/40';
        break;
      case 'Pending':
        colorClasses = 'bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/40';
        break;
      case 'Not Started':
        colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        break;
    }
  } else if (type === 'priority') {
    switch (value) {
      case 'High':
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/40';
        break;
      case 'Medium':
        colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/40';
        break;
      case 'Low':
        colorClasses = 'bg-teal-50 text-teal-700 border border-teal-200/70 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/40';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${colorClasses} shadow-sm transition-all`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {value}
    </span>
  );
};
