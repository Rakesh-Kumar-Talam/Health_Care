import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card-health p-6 animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl pt-2"></div>
    </div>
  );
};