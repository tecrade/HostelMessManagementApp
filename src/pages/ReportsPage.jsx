import React, { useMemo } from "react";
import { BarChart3, Utensils, Award, DollarSign, ArrowUpRight } from "lucide-react";
import { useMonthAttendance } from "../hooks/useAttendance";
import { StatCardSkeleton } from "../components/SkeletonLoader";

export default function ReportsPage({ adminUid, members, mealPrices, currency }) {
  // Current month represents July 2026, previous months are June and May 2026
  const currentMonthStr = "2026-07";
  const juneMonthStr = "2026-06";
  const mayMonthStr = "2026-05";

  const { monthRecords: currentRecords, loading: currentLoading } = useMonthAttendance(adminUid, currentMonthStr);
  const { monthRecords: juneRecords, loading: juneLoading } = useMonthAttendance(adminUid, juneMonthStr);
  const { monthRecords: mayRecords, loading: mayLoading } = useMonthAttendance(adminUid, mayMonthStr);

  const stats = useMemo(() => {
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;
    let specialExpense = 0;
    let mealExpense = 0;
    let grandTotal = 0;

    currentRecords.forEach((r) => {
      if (r.breakfast) {
        breakfastCount++;
        mealExpense += mealPrices.breakfast || 0;
      }
      if (r.lunch) {
        lunchCount++;
        mealExpense += mealPrices.lunch || 0;
      }
      if (r.dinner) {
        dinnerCount++;
        mealExpense += mealPrices.dinner || 0;
      }
      const specialsSum = (r.specialItems || []).reduce((sum, item) => sum + (item.price || 0), 0);
      specialExpense += specialsSum;
      grandTotal += (r.dailyTotal || 0);
    });

    // Compute previous month sums for comparative chart
    const juneSum = juneRecords.reduce((sum, r) => sum + (r.dailyTotal || 0), 0);
    const maySum = mayRecords.reduce((sum, r) => sum + (r.dailyTotal || 0), 0);

    return {
      breakfastCount,
      lunchCount,
      dinnerCount,
      specialExpense,
      mealExpense,
      grandTotal,
      juneSum,
      maySum
    };
  }, [currentRecords, juneRecords, mayRecords, mealPrices]);

  const loading = currentLoading || juneLoading || mayLoading;

  // Chart Details
  const chartData = [
    { label: "May 2026", total: stats.maySum },
    { label: "June 2026", total: stats.juneSum },
    { label: "July 2026 (Live)", total: stats.grandTotal }
  ];

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1000);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div>
        <h2 className="font-heading font-extrabold text-xl text-text-dark">Statistics & Reports</h2>
        <p className="text-xs text-text-gray mt-0.5">Real-time analysis of meal consumption patterns and revenue invoices</p>
      </div>

      {/* Grid of Report Aggregates */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Breakfast Eaten */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider block">Breakfasts Served</span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-text-dark mt-2 block">
            {stats.breakfastCount} Meals
          </span>
          <span className="text-[9px] text-text-gray font-medium mt-1.5 block">
            Revenue: {currency}{stats.breakfastCount * (mealPrices.breakfast || 0)}
          </span>
          <div className="absolute top-4 right-4 text-amber-500 bg-amber-500/10 p-1.5 rounded-lg">
            <Utensils className="h-4 w-4" />
          </div>
        </div>

        {/* Card 2: Lunch Eaten */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider block">Lunches Served</span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-text-dark mt-2 block">
            {stats.lunchCount} Meals
          </span>
          <span className="text-[9px] text-text-gray font-medium mt-1.5 block">
            Revenue: {currency}{stats.lunchCount * (mealPrices.lunch || 0)}
          </span>
          <div className="absolute top-4 right-4 text-blue-500 bg-blue-500/10 p-1.5 rounded-lg">
            <Utensils className="h-4 w-4" />
          </div>
        </div>

        {/* Card 3: Dinner Eaten */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider block">Dinners Served</span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-text-dark mt-2 block">
            {stats.dinnerCount} Meals
          </span>
          <span className="text-[9px] text-text-gray font-medium mt-1.5 block">
            Revenue: {currency}{stats.dinnerCount * (mealPrices.dinner || 0)}
          </span>
          <div className="absolute top-4 right-4 text-purple-500 bg-purple-500/10 p-1.5 rounded-lg">
            <Utensils className="h-4 w-4" />
          </div>
        </div>

        {/* Card 4: Special Expenses */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider block">Special Item Sales</span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-warning mt-2 block">
            {currency}{stats.specialExpense}
          </span>
          <span className="text-[9px] text-text-gray font-medium mt-1.5 block">
            Extra orders checkmarks
          </span>
          <div className="absolute top-4 right-4 text-warning bg-warning/10 p-1.5 rounded-lg">
            <Award className="h-4 w-4" />
          </div>
        </div>

        {/* Card 5: Meal Expenses */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider block">Regular Menu Revenue</span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-text-dark mt-2 block">
            {currency}{stats.mealExpense}
          </span>
          <span className="text-[9px] text-text-gray font-medium mt-1.5 block">
            Excludes special custom items
          </span>
          <div className="absolute top-4 right-4 text-text-dark bg-gray-100 p-1.5 rounded-lg">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        {/* Card 6: Grand Income */}
        <div className="bg-gradient-to-tr from-primary/5 to-secondary/5 border border-primary/15 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-wider block">Total Combined Revenue</span>
          <span className="font-heading font-black text-xl sm:text-2xl text-primary mt-2 block">
            {currency}{stats.grandTotal}
          </span>
          <span className="text-[9px] text-primary/80 font-bold mt-1.5 block">
            July Gross mess collections
          </span>
          <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1.5 rounded-lg">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

      </div>

      {/* SVG Bar Chart Comparison */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-text-dark">Historical Revenue Invoices</h3>
            <p className="text-[10px] sm:text-xs text-text-gray mt-0.5">Comparing mess billing sums across May, June, and July</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col justify-end h-64 relative border-b border-l border-gray-200/70 pb-2 pl-4 px-2 sm:px-4">
          {/* Horizontal Grid lines */}
          <div className="absolute left-0 right-0 top-1/4 border-t border-gray-100 border-dashed pointer-events-none" />
          <div className="absolute left-0 right-0 top-2/4 border-t border-gray-100 border-dashed pointer-events-none" />
          <div className="absolute left-0 right-0 top-3/4 border-t border-gray-100 border-dashed pointer-events-none" />

          {/* Bar Pillars */}
          <div className="flex justify-around items-end h-full z-10 w-full relative">
            {chartData.map((data, idx) => {
              const percentHeight = (data.total / maxTotal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 w-1/4 group cursor-pointer">
                  {/* Tooltip price bubble */}
                  <span className="bg-text-dark text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                    {currency}{data.total.toLocaleString()}
                  </span>
                  
                  {/* Bar pillar */}
                  <div
                    className={`w-10 sm:w-16 rounded-t-lg sm:rounded-t-xl transition-all duration-500 ease-out shadow-md ${
                      idx === 2
                        ? "bg-gradient-to-t from-primary to-secondary group-hover:brightness-105"
                        : "bg-gray-300 group-hover:bg-primary/45"
                    }`}
                    style={{ height: `${percentHeight}%`, minHeight: "15px" }}
                  />

                  <span className="text-[9px] sm:text-[10px] font-bold text-text-gray uppercase tracking-wider text-center truncate w-full">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
