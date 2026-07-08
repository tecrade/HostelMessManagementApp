import React from "react";
import { ArrowLeft, Check, Minus, ListCollapse, ReceiptText } from "lucide-react";
import { useMemberMonthAttendance } from "../hooks/useAttendance";
import { getDaysInMonth, getMonthIndex } from "../data/mockData";
import { TableRowSkeleton } from "../components/SkeletonLoader";

export default function MonthlyDetails({
  adminUid,
  memberId,
  members,
  monthName,
  year = 2026,
  mealPrices = { breakfast: 50, lunch: 50, dinner: 50 },
  currency = "₹",
  onBack
}) {
  const member = members.find((m) => m.id === memberId);
  
  // Format Month to YYYY-MM
  const monthIdx = getMonthIndex(monthName);
  const padMonth = String(monthIdx + 1).padStart(2, "0");
  const yearMonthStr = `${year}-${padMonth}`;
  
  const { memberMonthRecords, loading } = useMemberMonthAttendance(adminUid, memberId, yearMonthStr);
  const daysCount = getDaysInMonth(monthName, year);

  if (!member) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="font-heading font-bold text-xl text-text-dark">Member Not Found</h2>
        <button onClick={onBack} className="text-primary font-semibold flex items-center gap-2 justify-center mx-auto cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  // Generate table rows for each day of the month
  const calendarRows = [];
  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;
  let specialExpenseTotal = 0;
  let grandTotal = 0;

  for (let day = 1; day <= daysCount; day++) {
    const formattedDayStr = `${yearMonthStr}-${String(day).padStart(2, "0")}`;
    const dayRecord = memberMonthRecords.find((r) => r.date === formattedDayStr);

    if (dayRecord) {
      if (dayRecord.breakfast) breakfastCount++;
      if (dayRecord.lunch) lunchCount++;
      if (dayRecord.dinner) dinnerCount++;
      
      const specialsSum = (dayRecord.specialItems || []).reduce((sum, item) => sum + (item.price || 0), 0);
      specialExpenseTotal += specialsSum;
      grandTotal += (dayRecord.dailyTotal || 0);

      calendarRows.push({
        date: day,
        breakfast: dayRecord.breakfast,
        lunch: dayRecord.lunch,
        dinner: dayRecord.dinner,
        specialItems: dayRecord.specialItems || [],
        dailyTotal: dayRecord.dailyTotal
      });
    } else {
      calendarRows.push({
        date: day,
        breakfast: false,
        lunch: false,
        dinner: false,
        specialItems: [],
        dailyTotal: 0
      });
    }
  }

  const mealExpenseTotal =
    breakfastCount * (mealPrices.breakfast || 0) +
    lunchCount * (mealPrices.lunch || 0) +
    dinnerCount * (mealPrices.dinner || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Navigation Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-text-gray hover:text-text-dark bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer w-max"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Month List</span>
        </button>

        <div className="text-right sm:text-right">
          <span className="text-xs font-semibold text-text-gray block">Monthly Attendance Log</span>
          <span className="font-heading font-bold text-sm text-primary">
            {member.name} • {monthName} {year}
          </span>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/40">
          <h3 className="font-heading font-bold text-sm text-text-dark flex items-center gap-2">
            <ListCollapse className="h-4 w-4 text-primary" />
            <span>Daily Mess Record</span>
          </h3>
          <span className="text-[10px] sm:text-[11px] text-text-gray font-bold uppercase tracking-wider bg-white border border-gray-150 rounded-lg px-2 py-0.5">
            Rates: B={currency}{mealPrices.breakfast} · L={currency}{mealPrices.lunch} · D={currency}{mealPrices.dinner}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-text-gray bg-gray-50/50 uppercase tracking-wider">
                <th className="py-3 px-5 sm:px-6">Date</th>
                <th className="py-3 px-5 sm:px-6 text-center">Breakfast</th>
                <th className="py-3 px-5 sm:px-6 text-center">Lunch</th>
                <th className="py-3 px-5 sm:px-6 text-center">Dinner</th>
                <th className="py-3 px-5 sm:px-6 text-right">Specials Charged</th>
                <th className="py-3 px-5 sm:px-6 text-right">Daily Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-text-dark">
              {loading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : (
                calendarRows.map((row) => (
                  <tr key={row.date} className="hover:bg-primary-light/10 transition-colors">
                    <td className="py-2.5 px-5 sm:px-6 font-bold">
                      {row.date} {monthName.substring(0, 3)}
                    </td>
                    <td className="py-2.5 px-5 sm:px-6 text-center">
                      <div className="inline-flex items-center justify-center">
                        {row.breakfast ? (
                          <div className="h-5 w-5 bg-success/15 rounded-md flex items-center justify-center text-success">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-5 sm:px-6 text-center">
                      <div className="inline-flex items-center justify-center">
                        {row.lunch ? (
                          <div className="h-5 w-5 bg-success/15 rounded-md flex items-center justify-center text-success">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-5 sm:px-6 text-center">
                      <div className="inline-flex items-center justify-center">
                        {row.dinner ? (
                          <div className="h-5 w-5 bg-success/15 rounded-md flex items-center justify-center text-success">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-5 sm:px-6 text-right font-medium text-text-gray">
                      {row.specialItems.length > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {row.specialItems.map((item, i) => (
                            <span key={i} className="text-[10px] font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded-md">
                              {item.name} ({currency}{item.price})
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-5 sm:px-6 text-right font-extrabold text-text-dark">
                      {currency}{row.dailyTotal}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Invoice Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

        <h3 className="font-heading font-bold text-base text-text-dark flex items-center gap-2 mb-4">
          <ReceiptText className="h-4.5 w-4.5 text-primary" />
          <span>Monthly Invoice Summary</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-bg-slate p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-text-gray uppercase tracking-wider">Breakfasts</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-heading font-extrabold text-lg text-text-dark">{breakfastCount}</span>
              <span className="text-[10px] text-text-gray font-semibold">eaten</span>
            </div>
            <span className="text-[10px] text-text-gray/80 mt-1">Cost: {currency}{breakfastCount * mealPrices.breakfast}</span>
          </div>

          <div className="bg-bg-slate p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-text-gray uppercase tracking-wider">Lunches</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-heading font-extrabold text-lg text-text-dark">{lunchCount}</span>
              <span className="text-[10px] text-text-gray font-semibold">eaten</span>
            </div>
            <span className="text-[10px] text-text-gray/80 mt-1">Cost: {currency}{lunchCount * mealPrices.lunch}</span>
          </div>

          <div className="bg-bg-slate p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-text-gray uppercase tracking-wider">Dinners</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-heading font-extrabold text-lg text-text-dark">{dinnerCount}</span>
              <span className="text-[10px] text-text-gray font-semibold">eaten</span>
            </div>
            <span className="text-[10px] text-text-gray/80 mt-1">Cost: {currency}{dinnerCount * mealPrices.dinner}</span>
          </div>

          <div className="bg-bg-slate p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-text-gray uppercase tracking-wider">Special Items Menu</span>
            <div className="mt-2">
              <span className="font-heading font-extrabold text-lg text-warning">
                {currency}{specialExpenseTotal}
              </span>
            </div>
            <span className="text-[10px] text-text-gray/80 mt-1">Sum of all specials eaten</span>
          </div>

          <div className="bg-bg-slate p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-text-gray uppercase tracking-wider">Regular Meals Cost</span>
            <div className="mt-2">
              <span className="font-heading font-extrabold text-lg text-text-dark">
                {currency}{mealExpenseTotal}
              </span>
            </div>
            <span className="text-[10px] text-text-gray/80 mt-1">Total standard menu</span>
          </div>

          <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10 flex flex-col justify-between relative overflow-hidden">
            <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">Grand Net Total</span>
            <div className="mt-2">
              <span className="font-heading font-black text-xl text-primary">
                {currency}{grandTotal}
              </span>
            </div>
            <span className="text-[10px] text-primary/80 mt-1 font-bold">Sum of meals + specials</span>
          </div>
        </div>
      </div>
    </div>
  );
}
