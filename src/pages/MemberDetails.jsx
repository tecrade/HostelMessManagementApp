import React, { useMemo } from 'react';
import { ArrowLeft, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';
import { getAvatarColor } from '../utils/avatarColor';
import { useMemberYearAttendance } from '../hooks/useAttendance';
import { MonthCardSkeleton } from '../components/SkeletonLoader';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Summarise one month's flat records array
const computeSummary = (records = []) => {
  let mealCount = 0;
  let grandTotal = 0;
  records.forEach((r) => {
    if (r.breakfast) mealCount++;
    if (r.lunch) mealCount++;
    if (r.dinner) mealCount++;
    grandTotal += r.dailyTotal || 0;
  });
  return { mealCount, grandTotal };
};

export default function MemberDetails({
  uid,           // admin UID
  memberId,
  members,
  currency = '₹',
  onSelectMonth, // (monthName, year) => void
  onBack,
}) {
  const member = members.find((m) => m.id === memberId);
  const year = new Date().getFullYear();

  // Real-time listener for all attendance docs for this member in the current year
  const { memberYearRecords, loading } = useMemberYearAttendance(uid, memberId, String(year));

  // Group records by month name
  const recordsByMonth = useMemo(() => {
    const map = {};
    MONTHS.forEach((m) => { map[m] = []; });
    (memberYearRecords || []).forEach((r) => {
      if (!r.date) return;
      const monthIdx = parseInt(r.date.split('-')[1], 10) - 1;
      const monthName = MONTHS[monthIdx];
      if (monthName) map[monthName].push(r);
    });
    return map;
  }, [memberYearRecords]);

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

  const avColor = getAvatarColor(member.name);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-text-gray hover:text-text-dark bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Directory</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-xl pointer-events-none" />

        <div className={`h-20 w-20 rounded-2xl bg-gradient-to-tr flex items-center justify-center font-heading font-extrabold text-3xl shadow-lg border flex-shrink-0 ${avColor}`}>
          {member.avatar || member.name?.split(' ').map((n) => n[0]).join('') || '?'}
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left w-full">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="font-heading font-bold text-2xl text-text-dark">{member.name}</h2>
              <span className={`inline-block mx-auto md:mx-0 w-max text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                member.status === 'Active'
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-gray-100 border-gray-200 text-text-gray'
              }`}>
                {member.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-text-gray mt-1">Hostel Member Profile • Year {year}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {member.phone && (
              <div className="flex items-center gap-2.5 text-xs text-text-gray bg-bg-slate p-2.5 rounded-xl border border-gray-100">
                <Phone className="h-4 w-4 text-primary/80 flex-shrink-0" />
                <span className="font-medium">{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2.5 text-xs text-text-gray bg-bg-slate p-2.5 rounded-xl border border-gray-100 max-w-[220px] overflow-hidden">
                <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
                <span className="font-medium truncate">{member.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-xs text-text-gray bg-bg-slate p-2.5 rounded-xl border border-gray-100">
              <Calendar className="h-4 w-4 text-text-gray/80 flex-shrink-0" />
              <span className="font-medium">
                Joined {member.joinDate?.toDate
                  ? member.joinDate.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : member.joinDate
                  ? new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly grid */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-dark">Monthly Mess Summary — {year}</h3>
          <p className="text-xs text-text-gray mt-0.5">Select a month to view the daily attendance sheet</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {MONTHS.map((m) => <MonthCardSkeleton key={m} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {MONTHS.map((month) => {
              const { mealCount, grandTotal } = computeSummary(recordsByMonth[month]);
              const isCurrentMonth = MONTHS[new Date().getMonth()] === month;

              return (
                <div
                  key={month}
                  onClick={() => onSelectMonth(month, year)}
                  className={`group bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isCurrentMonth ? 'border-primary/30 bg-blue-50/20' : 'border-gray-200 hover:border-primary/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-heading font-bold text-text-dark text-sm group-hover:text-primary transition-colors">
                        {month}
                      </h4>
                      {isCurrentMonth && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Now</span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-text-gray">
                        <span>Meals</span>
                        <span className="font-semibold text-text-dark">{mealCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-text-gray">
                        <span>Total</span>
                        <span className="font-bold text-primary">{currency}{grandTotal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-primary border-t border-gray-100 pt-2.5 group-hover:text-primary-hover">
                    <span>View</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
