import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="h-14 bg-gray-100 rounded-xl border border-gray-200/50" />
        <div className="h-14 bg-gray-100 rounded-xl border border-gray-200/50" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-1/3 pt-1" />
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="py-4 px-5">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </td>
      ))}
    </tr>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-3 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
    </div>
  );
};

export const MonthCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-sm space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-text-gray tracking-wider uppercase">Loading database...</span>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto my-6 animate-fade-in">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mx-auto border border-primary/5">
          <Icon className="h-6.5 w-6.5 text-primary" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-text-dark text-base sm:text-lg">{title}</h3>
        {description && <p className="text-xs text-text-gray max-w-sm mx-auto leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
