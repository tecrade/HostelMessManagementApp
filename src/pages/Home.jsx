import React from 'react';
import { User, Calendar, CreditCard, Search, ArrowRight, Plus } from 'lucide-react';
import { getAvatarColor } from '../utils/avatarColor';
import { CardSkeleton } from '../components/SkeletonLoader';

// Compute month totals from flat attendance records array
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

export default function Home({
  members,
  membersLoading,
  attendance,        // map: memberId -> [attendance records for current month]
  searchQuery,
  setSearchQuery,
  onSelectMember,
  currency = '₹',
  onNavigateToAdmin,
  isAdmin,
}) {
  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q) ||
      member.phone?.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-10 blur-2xl pointer-events-none" />
        <div className="max-w-xl relative z-10 space-y-2.5">
          <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Portal
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
            Hostel Mess Portal
          </h1>
          <p className="text-white/80 text-sm font-medium leading-relaxed">
            Check monthly meal attendance, calculate individual billing, and monitor reports.
          </p>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-gray pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search members by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white text-sm rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all duration-200"
        />
      </div>

      {/* Members section header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl text-text-dark">All Members</h2>
          <p className="text-xs text-text-gray mt-0.5">Click any card to inspect detailed monthly reports</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full border border-primary/5">
            {filteredMembers.length} Member{filteredMembers.length !== 1 ? 's' : ''}
          </span>
          {isAdmin && (
            <button
              onClick={() => onNavigateToAdmin?.('members')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Members grid */}
      {membersLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-text-gray mx-auto">
            <User className="h-6 w-6" />
          </div>
          <h3 className="font-heading font-semibold text-text-dark text-base">
            {searchQuery ? 'No Members Found' : 'No Members Yet'}
          </h3>
          <p className="text-xs text-text-gray max-w-sm mx-auto">
            {searchQuery
              ? `No member matches "${searchQuery}". Try a different search.`
              : isAdmin
              ? 'Go to Admin Dashboard → Add Member to register your first resident.'
              : 'Contact your administrator to add members to the system.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-bg-slate hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-text-dark transition-all cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            // attendance is memberId -> [records] for the current month
            const records = attendance[member.id] || [];
            const { mealCount, grandTotal } = computeSummary(records);
            const avColor = getAvatarColor(member.name);

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className="group bg-white border border-gray-200/80 hover:border-primary/30 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <span
                  className={`absolute top-4 right-4 h-2 w-2 rounded-full ${member.status === 'Active' ? 'bg-success' : 'bg-gray-300'}`}
                  title={member.status}
                />

                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr flex items-center justify-center font-heading font-bold text-lg border group-hover:scale-105 transition-transform duration-200 flex-shrink-0 ${avColor}`}>
                      {member.avatar || member.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-heading font-bold text-text-dark text-[15px] group-hover:text-primary transition-colors duration-150 leading-tight truncate">
                        {member.name}
                      </h3>
                      <span className="text-[11px] text-text-gray mt-0.5 font-medium truncate">
                        {member.email || member.phone || 'No contact info'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-bg-slate group-hover:bg-primary-light/40 rounded-xl p-3 border border-gray-100 transition-colors">
                      <span className="text-[10px] font-semibold text-text-gray block mb-1">
                        This Month
                      </span>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-primary/80 flex-shrink-0" />
                        <span className="font-heading font-bold text-sm text-text-dark">
                          {currency}{grandTotal}
                        </span>
                      </div>
                    </div>

                    <div className="bg-bg-slate group-hover:bg-primary-light/40 rounded-xl p-3 border border-gray-100 transition-colors">
                      <span className="text-[10px] font-semibold text-text-gray block mb-1">
                        Meals
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                        <span className="font-heading font-bold text-sm text-text-dark">
                          {mealCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs font-semibold text-primary group-hover:text-primary-hover">
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
