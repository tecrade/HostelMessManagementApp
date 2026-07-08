import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  Bell,
  ChevronDown,
  Menu,
  X,
  Hash,
  Copy,
  Check,
  RefreshCw,
  Share2
} from "lucide-react";
import { getDaysInMonth, getMonthIndex } from "../data/mockData";
import { getAvatarColor } from "../utils/avatarColor";
import {
  addMember,
  updateMember,
  deleteMember,
  saveBulkAttendance,
  saveSingleAttendance
} from "../firebase/firestore";
import { updateMessCode, generateUniqueCode } from "../firebase/messCode";
import { useDateAttendance, useMemberMonthAttendance } from "../hooks/useAttendance";
import SpecialSelector from "../components/SpecialSelector";
import MobileDrawer from "../components/MobileDrawer";
import SpecialsPage from "./SpecialsPage";
import SettingsPage from "./SettingsPage";
import ReportsPage from "./ReportsPage";
import { TableRowSkeleton, StatCardSkeleton, EmptyState } from "../components/SkeletonLoader";

export default function AdminDashboard({
  adminUid,
  adminName,
  messCode,
  members = [],
  membersLoading,
  specials = [],
  specialsLoading,
  settings,
  settingsLoading,
  mealPrices,
  currency,
  onLogout,
  setView,
  triggerToast,
  drawerOpen = false,
  setDrawerOpen
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeRegenerating, setCodeRegenerating] = useState(false);

  const handleCopyCode = () => {
    if (!messCode) return;
    navigator.clipboard.writeText(messCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const handleShareCode = () => {
    if (!messCode) return;
    const text = `Join my mess portal! Use Mess Code: ${messCode} at the app.`;
    if (navigator.share) {
      navigator.share({ title: "Mess Code", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      triggerToast("Share text copied to clipboard!", "success");
    }
  };

  const handleRegenerateCode = async () => {
    if (!confirm("Regenerate Mess Code? Students will need the new code to access your mess.")) return;
    setCodeRegenerating(true);
    try {
      const newCode = await generateUniqueCode();
      await updateMessCode(adminUid, messCode, newCode);
      triggerToast(`Mess Code updated to ${newCode}!`, "success");
    } catch (err) {
      triggerToast("Failed to regenerate code: " + err.message, "danger");
    } finally {
      setCodeRegenerating(false);
    }
  };

  // --- Add Member Form State ---
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberStatus, setNewMemberStatus] = useState("Active");
  const [formSaving, setFormSaving] = useState(false);

  // --- Quick Daily Attendance State ---
  const [quickDateStr, setQuickDateStr] = useState(() => {
    const today = new Date();
    // Format YYYY-MM-DD
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  // Real-time day attendance subscription
  const { attendanceMap, loading: dateAttendanceLoading } = useDateAttendance(adminUid, quickDateStr);
  const [dailyAttendanceState, setDailyAttendanceState] = useState({}); // memberId -> rowRecord

  // Sync daily state when Firestore map loads
  useEffect(() => {
    const activeMembers = members.filter((m) => m.status === "Active");
    const newState = {};
    activeMembers.forEach((member) => {
      const existing = attendanceMap[member.id] || {};
      newState[member.id] = {
        breakfast: !!existing.breakfast,
        lunch: !!existing.lunch,
        dinner: !!existing.dinner,
        specialIds: existing.specialIds || [],
        specialItems: existing.specialItems || [],
        dailyTotal: existing.dailyTotal || 0
      };
    });
    setDailyAttendanceState(newState);
  }, [attendanceMap, members, quickDateStr]);

  // --- Edit Member Monthly Spreadsheet State ---
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingMonth, setEditingMonth] = useState("July");
  const [editingYear, setEditingYear] = useState(2026);
  
  // Create yearMonth state for subscription
  const editingMonthIdx = getMonthIndex(editingMonth);
  const editingPadMonth = String(editingMonthIdx + 1).padStart(2, "0");
  const editingYearMonthStr = `${editingYear}-${editingPadMonth}`;
  
  // Real-time member monthly records subscription
  const { memberMonthRecords, loading: memberMonthLoading } = useMemberMonthAttendance(
    adminUid,
    editingMemberId,
    editingYearMonthStr
  );
  const [memberMonthState, setMemberMonthState] = useState([]); // array of records: index maps to day-1

  // Sync member monthly spreadsheet local buffer when Firestore records load
  useEffect(() => {
    if (!editingMemberId) return;
    const daysInMonth = getDaysInMonth(editingMonth, editingYear);
    const initialGrid = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${editingYearMonthStr}-${String(day).padStart(2, "0")}`;
      const existing = memberMonthRecords.find((r) => r.date === dateKey);

      if (existing) {
        initialGrid.push({
          date: day,
          breakfast: !!existing.breakfast,
          lunch: !!existing.lunch,
          dinner: !!existing.dinner,
          specialIds: existing.specialIds || [],
          specialItems: existing.specialItems || [],
          dailyTotal: existing.dailyTotal || 0
        });
      } else {
        initialGrid.push({
          date: day,
          breakfast: false,
          lunch: false,
          dinner: false,
          specialIds: [],
          specialItems: [],
          dailyTotal: 0
        });
      }
    }
    setMemberMonthState(initialGrid);
  }, [memberMonthRecords, editingMemberId, editingMonth, editingYear]);

  // Compute stats for July 2026 (overview widgets)
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "Active");
  const activeCount = activeMembers.length;

  // --- Handlers ---
  
  // Handle Add Member Submit
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      triggerToast("Please enter the resident's name.", "warning");
      return;
    }

    setFormSaving(true);
    try {
      await addMember(adminUid, {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        phone: newMemberPhone.trim(),
        status: newMemberStatus
      });
      triggerToast(`Member "${newMemberName.trim()}" enrolled successfully!`, "success");
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPhone("");
      setNewMemberStatus("Active");
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to enroll member: " + err.message, "danger");
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Member Profile
  const handleDeleteClick = async (member) => {
    if (confirm(`Are you sure you want to delete ${member.name}? This will permanently remove all their daily logs.`)) {
      try {
        await deleteMember(adminUid, member.id);
        triggerToast(`Member profile and records deleted.`, "success");
      } catch (err) {
        triggerToast("Failed to delete member: " + err.message, "danger");
      }
    }
  };

  // Start Editing Attendance for a Member
  const startEditingAttendance = (memberId) => {
    setEditingMemberId(memberId);
    setEditingMonth("July");
    setEditingYear(2026);
    setActiveTab("edit-member");
  };

  // Toggle quick attendance meal checkbox in bulk logger
  const handleQuickMealToggle = (memberId, meal, checked) => {
    setDailyAttendanceState((prev) => {
      const row = prev[memberId] || { breakfast: false, lunch: false, dinner: false, specialIds: [], specialItems: [] };
      const updatedRow = { ...row, [meal]: checked };
      
      // Compute new daily total
      const mealCost =
        (updatedRow.breakfast ? mealPrices.breakfast : 0) +
        (updatedRow.lunch ? mealPrices.lunch : 0) +
        (updatedRow.dinner ? mealPrices.dinner : 0);
      
      const specialsCost = updatedRow.specialItems.reduce((sum, item) => sum + (item.price || 0), 0);
      updatedRow.dailyTotal = mealCost + specialsCost;

      return { ...prev, [memberId]: updatedRow };
    });
  };

  // Handle specials change in daily bulk logger row
  const handleQuickSpecialsChange = (memberId, newSpecialIds) => {
    setDailyAttendanceState((prev) => {
      const row = prev[memberId] || { breakfast: false, lunch: false, dinner: false, specialIds: [], specialItems: [] };
      
      // Map selected IDs to snapshotted Special Items objects
      const selectedSpecials = specials
        .filter((s) => newSpecialIds.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name, price: s.price }));

      const updatedRow = { ...row, specialIds: newSpecialIds, specialItems: selectedSpecials };

      // Compute new daily total
      const mealCost =
        (updatedRow.breakfast ? mealPrices.breakfast : 0) +
        (updatedRow.lunch ? mealPrices.lunch : 0) +
        (updatedRow.dinner ? mealPrices.dinner : 0);
      
      const specialsCost = selectedSpecials.reduce((sum, item) => sum + (item.price || 0), 0);
      updatedRow.dailyTotal = mealCost + specialsCost;

      return { ...prev, [memberId]: updatedRow };
    });
  };

  // Save Bulk Attendance for Date
  const handleSaveBulkAttendance = async () => {
    setFormSaving(true);
    try {
      await saveBulkAttendance(adminUid, quickDateStr, dailyAttendanceState);
      triggerToast(`Attendance logs saved successfully for ${quickDateStr}!`, "success");
      setActiveTab("dashboard");
    } catch (err) {
      triggerToast("Failed to save attendance: " + err.message, "danger");
    } finally {
      setFormSaving(false);
    }
  };

  // Monthly spreadsheet: toggle checkbox in row
  const handleGridMealToggle = (index, meal, checked) => {
    setMemberMonthState((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [meal]: checked };
      
      const mealCost =
        (row.breakfast ? mealPrices.breakfast : 0) +
        (row.lunch ? mealPrices.lunch : 0) +
        (row.dinner ? mealPrices.dinner : 0);
      const specialsCost = row.specialItems.reduce((sum, item) => sum + (item.price || 0), 0);
      row.dailyTotal = mealCost + specialsCost;

      updated[index] = row;
      return updated;
    });
  };

  // Monthly spreadsheet: specials change in row
  const handleGridSpecialsChange = (index, newSpecialIds) => {
    setMemberMonthState((prev) => {
      const updated = [...prev];
      
      // Map selected IDs to snapshotted Special Items objects
      const selectedSpecials = specials
        .filter((s) => newSpecialIds.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name, price: s.price }));

      const row = { ...updated[index], specialIds: newSpecialIds, specialItems: selectedSpecials };

      const mealCost =
        (row.breakfast ? mealPrices.breakfast : 0) +
        (row.lunch ? mealPrices.lunch : 0) +
        (row.dinner ? mealPrices.dinner : 0);
      const specialsCost = selectedSpecials.reduce((sum, item) => sum + (item.price || 0), 0);
      row.dailyTotal = mealCost + specialsCost;

      updated[index] = row;
      return updated;
    });
  };

  // Save Monthly Grid Changes
  const handleSaveMonthlyGrid = async () => {
    setFormSaving(true);
    try {
      const recordsMap = {};
      memberMonthState.forEach((row) => {
        const dateKey = `${editingYearMonthStr}-${String(row.date).padStart(2, "0")}`;
        recordsMap[dateKey] = {
          breakfast: row.breakfast,
          lunch: row.lunch,
          dinner: row.dinner,
          specialIds: row.specialIds,
          specialItems: row.specialItems,
          dailyTotal: row.dailyTotal
        };
      });

      // Write each day to Firestore
      const batch = [];
      Object.entries(recordsMap).forEach(([dateStr, record]) => {
        batch.push(saveSingleAttendance(adminUid, editingMemberId, dateStr, record));
      });
      await Promise.all(batch);

      const m = members.find((x) => x.id === editingMemberId);
      triggerToast(`Updated spreadsheet logs for ${m?.name || "Member"}!`, "success");
      setEditingMemberId(null);
      setActiveTab("dashboard");
    } catch (err) {
      triggerToast("Failed to update sheet: " + err.message, "danger");
    } finally {
      setFormSaving(false);
    }
  };

  // --- Sub-View Switcher Logic ---
  const activeMemberName = members.find((m) => m.id === editingMemberId)?.name || "Member";

  return (
    <div className="flex min-h-[calc(100vh-68px)] max-w-7xl mx-auto flex-col md:flex-row bg-[#F8FAFC] border-x border-gray-200">
      
      {/* 1. Left Sidebar Navigation - Hidden or collapsed on Mobile */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 p-4 flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Admin Avatar Banner */}
          <div className="flex items-center gap-3 bg-gradient-to-tr from-primary/5 to-secondary/5 p-3 rounded-2xl border border-primary/10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              {adminName ? adminName[0].toUpperCase() : "A"}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-text-dark leading-none truncate">{adminName || "Mess Admin"}</h4>
              <span className="text-[9px] text-text-gray font-bold tracking-wider uppercase">Administrator</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("dashboard"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "dashboard" || activeTab === "edit-member"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab("members"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "members"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Add New Member</span>
            </button>

            <button
              onClick={() => { setActiveTab("attendance"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" />
              <span>Daily Attendance</span>
            </button>

            <button
              onClick={() => { setActiveTab("specials"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "specials"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>Special Items</span>
            </button>

            <button
              onClick={() => { setActiveTab("reports"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "reports"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              <span>Statistics Reports</span>
            </button>

            <button
              onClick={() => { setActiveTab("settings"); setEditingMemberId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-gray hover:text-text-dark hover:bg-gray-100/80"
              }`}
            >
              <SettingsIcon className="h-4.5 w-4.5" />
              <span>Meal Settings</span>
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-danger hover:bg-danger/10 transition-all cursor-pointer text-left"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Log Out Session</span>
        </button>
      </aside>

      {/* Hamburger Menu Trigger for Mobile Screens */}
      <div className="flex md:hidden bg-white px-4 py-3 border-b border-gray-200 items-center justify-between">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 border border-gray-200 rounded-xl text-text-dark hover:bg-gray-50 flex items-center justify-center cursor-pointer"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <span className="text-xs font-bold text-text-dark uppercase tracking-wider">
          Admin Dashboard Tab
        </span>
        <div className="w-8" /> {/* Balance spacer */}
      </div>

      {/* Mobile Drawer Slide-in menu container */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        adminName={adminName}
      />

      {/* 2. Main Administration Panel Viewport */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            {/* Admin Header overview */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-text-dark">Dashboard Overview</h3>
                <p className="text-xs text-text-gray mt-0.5 font-medium">Quick stats widgets and registered residents</p>
              </div>
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-1 bg-primary-light hover:bg-primary/10 text-primary text-xs font-bold px-3.5 py-2 border border-primary/20 rounded-xl cursor-pointer"
              >
                <span>Student View Portal</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 border border-indigo-100 p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
                <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Total Members</span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-indigo-950 mt-1 block">
                  {totalMembers}
                </span>
                <span className="text-[9px] text-indigo-500/80 font-bold block mt-1">
                  ({activeCount} active billing)
                </span>
              </div>

              <div className="bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 border border-emerald-100 p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Today Active Residents</span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-emerald-950 mt-1 block">
                  {activeCount}
                </span>
                <span className="text-[9px] text-emerald-500/80 font-bold block mt-1">
                  Eligible for daily meals log
                </span>
              </div>

              <div className="bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 border border-blue-100 p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
                <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Special Specials Config</span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-blue-950 mt-1 block">
                  {specials.filter((s) => s.enabled !== false).length}
                </span>
                <span className="text-[9px] text-blue-500/80 font-bold block mt-1">
                  Items inside specials menu
                </span>
              </div>

              <div className="bg-gradient-to-tr from-amber-500/5 to-orange-500/5 border border-amber-100 p-4 sm:p-5 rounded-2xl relative overflow-hidden group">
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Current Currency</span>
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-amber-950 mt-1 block">
                  {currency}
                </span>
                <span className="text-[9px] text-amber-500/80 font-bold block mt-1">
                  Configured symbol setup
                </span>
              </div>
            </div>

            {/* Mess Information Card */}
            {messCode && (
              <div className="bg-gradient-to-tr from-primary/8 to-secondary/8 border border-primary/15 rounded-3xl p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Mess Code</span>
                    </div>
                    <div className="font-heading font-extrabold text-3xl sm:text-4xl tracking-[0.3em] text-text-dark">
                      {messCode}
                    </div>
                    <p className="text-xs text-text-gray mt-1.5 font-medium">
                      Share this code with your residents so they can access the portal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-text-dark rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      {codeCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {codeCopied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleShareCode}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-text-dark rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </button>
                    <button
                      onClick={handleRegenerateCode}
                      disabled={codeRegenerating}
                      className="flex items-center gap-1.5 px-4 py-2 bg-danger/10 hover:bg-danger/15 border border-danger/20 text-xs font-bold text-danger rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${codeRegenerating ? 'animate-spin' : ''}`} />
                      {codeRegenerating ? 'Generating...' : 'Regenerate'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Members Directory Grid */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-text-dark">Registered Members</h4>
                <button
                  onClick={() => setActiveTab("members")}
                  className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Enrol Member</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold text-text-gray bg-gray-50 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-5">Name</th>
                      <th className="py-3 px-4 sm:px-5">Phone Number</th>
                      <th className="py-3 px-4 sm:px-5">Email Address</th>
                      <th className="py-3 px-4 sm:px-5 text-center">Status</th>
                      <th className="py-3 px-4 sm:px-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-text-dark">
                    {membersLoading ? (
                      <>
                        <TableRowSkeleton cols={5} />
                        <TableRowSkeleton cols={5} />
                        <TableRowSkeleton cols={5} />
                      </>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-0">
                          <EmptyState
                            icon={Users}
                            title="No members registered"
                            description="Start by enrolling students/residents to the hostel mess database."
                            action={
                              <button
                                onClick={() => setActiveTab("members")}
                                className="mx-auto flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" /> Enrol Member
                              </button>
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const avColor = getAvatarColor(member.name);
                        return (
                          <tr key={member.id} className="hover:bg-primary-light/5 transition-colors">
                            <td className="py-3 px-4 sm:px-5 flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr flex items-center justify-center font-bold text-xs border ${avColor}`}>
                                {member.avatar}
                              </div>
                              <span className="font-bold">{member.name}</span>
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-text-gray">{member.phone || "—"}</td>
                            <td className="py-3 px-4 sm:px-5 text-text-gray">{member.email || "—"}</td>
                            <td className="py-3 px-4 sm:px-5 text-center">
                              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                member.status === "Active"
                                  ? "bg-success/15 border-success/25 text-success"
                                  : "bg-gray-100 border-gray-250 text-text-gray"
                              }`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 sm:px-5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEditingAttendance(member.id)}
                                  className="p-1.5 text-primary hover:bg-primary-light rounded-lg cursor-pointer"
                                  title="Edit daily sheet records"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(member)}
                                  className="p-1.5 text-danger hover:bg-danger/10 rounded-lg cursor-pointer"
                                  title="Delete Member Profile"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADD NEW MEMBER */}
        {/* ======================================================== */}
        {activeTab === "members" && (
          <div className="max-w-xl mx-auto animate-fade-in space-y-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-text-dark">Enroll Resident</h3>
              <p className="text-xs text-text-gray mt-0.5">Setup a resident profile card to record billing invoice sheets</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-6 -translate-y-6 blur-lg pointer-events-none" />

              <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-dark/80 block font-sans">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Rahul Bose"
                    className="w-full px-4 py-2.5 bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dark/80 block">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dark/80 block">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="rahul@hostel.edu"
                      className="w-full px-4 py-2.5 bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-text-dark/80 block">Status</label>
                  <div className="flex gap-4 pt-1.5">
                    <label className="flex items-center gap-2 text-xs font-bold text-text-dark cursor-pointer select-none">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={newMemberStatus === "Active"}
                        onChange={() => setNewMemberStatus("Active")}
                        className="accent-primary h-4 w-4"
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-text-dark cursor-pointer select-none">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={newMemberStatus === "Inactive"}
                        onChange={() => setNewMemberStatus("Inactive")}
                        className="accent-primary h-4 w-4"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="flex-1 py-2.5 border border-gray-200 text-xs font-semibold text-text-gray hover:bg-gray-50 rounded-xl transition-all duration-150 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSaving}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-70 text-xs font-bold text-white rounded-xl shadow-md shadow-primary/10 transition-all duration-150 cursor-pointer text-center"
                  >
                    {formSaving ? "Saving..." : "Save Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DAILY ATTENDANCE QUICK LOG */}
        {/* ======================================================== */}
        {activeTab === "attendance" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick config card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-sm text-text-dark">Daily Attendance Logger</h3>
                <p className="text-[10px] text-text-gray mt-0.5 font-medium">Record checkmarks in bulk for active members quickly</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs font-bold text-text-gray">Attendance Date:</span>
                <input
                  type="date"
                  value={quickDateStr}
                  onChange={(e) => setQuickDateStr(e.target.value)}
                  className="px-3 py-1.5 bg-[#F8FAFC] border border-gray-200 text-xs font-bold text-text-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Attendance Spreadsheet Grid */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-text-gray bg-gray-50 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-5">Member Name</th>
                      <th className="py-3.5 px-4 sm:px-5 text-center">Breakfast Checkbox</th>
                      <th className="py-3.5 px-4 sm:px-5 text-center">Lunch Checkbox</th>
                      <th className="py-3.5 px-4 sm:px-5 text-center">Dinner Checkbox</th>
                      <th className="py-3.5 px-4 sm:px-5 text-center">Select Specials</th>
                      <th className="py-3.5 px-4 sm:px-5 text-right">Daily Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-text-dark bg-white">
                    {dateAttendanceLoading ? (
                      <>
                        <TableRowSkeleton cols={6} />
                        <TableRowSkeleton cols={6} />
                        <TableRowSkeleton cols={6} />
                      </>
                    ) : activeMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-text-gray font-normal text-xs">
                          No active members registered.
                        </td>
                      </tr>
                    ) : (
                      activeMembers.map((member) => {
                        const rowState = dailyAttendanceState[member.id] || {
                          breakfast: false,
                          lunch: false,
                          dinner: false,
                          specialIds: [],
                          specialItems: [],
                          dailyTotal: 0
                        };

                        return (
                          <tr key={member.id} className="hover:bg-primary-light/5 transition-colors">
                            <td className="py-3.5 px-4 sm:px-5 font-bold">{member.name}</td>
                            <td className="py-3.5 px-4 sm:px-5 text-center">
                              <input
                                type="checkbox"
                                checked={rowState.breakfast}
                                onChange={(e) => handleQuickMealToggle(member.id, "breakfast", e.target.checked)}
                                className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                              />
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 text-center">
                              <input
                                type="checkbox"
                                checked={rowState.lunch}
                                onChange={(e) => handleQuickMealToggle(member.id, "lunch", e.target.checked)}
                                className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                              />
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 text-center">
                              <input
                                type="checkbox"
                                checked={rowState.dinner}
                                onChange={(e) => handleQuickMealToggle(member.id, "dinner", e.target.checked)}
                                className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                              />
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 text-center">
                              <SpecialSelector
                                specials={specials}
                                selectedIds={rowState.specialIds}
                                onChange={(ids) => handleQuickSpecialsChange(member.id, ids)}
                                currency={currency}
                              />
                            </td>
                            <td className="py-3.5 px-4 sm:px-5 text-right font-extrabold text-text-dark font-sans">
                              {currency}{rowState.dailyTotal}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attendance Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-4 py-2 border border-gray-200 text-xs font-bold text-text-gray bg-white hover:bg-gray-50 rounded-xl transition-all duration-150 cursor-pointer"
              >
                Discard Edits
              </button>
              <button
                onClick={handleSaveBulkAttendance}
                disabled={formSaving || dateAttendanceLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-75 text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-all duration-150 flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Save className="h-4 w-4" />
                <span>{formSaving ? "Saving Logs..." : "Save Daily Records"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MEMBER EDIT PAGE (MONTH SHEET COMPONENT) */}
        {/* ======================================================== */}
        {activeTab === "edit-member" && editingMemberId && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 flex items-center justify-center font-bold text-sm rounded-xl border bg-gradient-to-tr ${getAvatarColor(activeMemberName)}`}>
                  {activeMemberName[0]}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-text-dark">{activeMemberName}</h3>
                  <p className="text-[10px] text-text-gray font-medium">Monthly calendar logging • Year {editingYear}</p>
                </div>
              </div>

              {/* Month / Year selection */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-gray">Select Month:</span>
                  <div className="relative">
                    <select
                      value={editingMonth}
                      onChange={(e) => setEditingMonth(e.target.value)}
                      className="appearance-none bg-[#F8FAFC] border border-gray-200 pl-3 pr-8 py-1.5 text-xs font-bold text-text-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-gray pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly grid calendar spreadsheet */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
                <span className="text-xs font-bold text-text-dark">Daily Spreadsheet Records</span>
                <span className="text-[10px] text-text-gray font-medium">Pricing and changes reflect on totals instantly</span>
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-text-gray bg-gray-50 uppercase tracking-wider">
                      <th className="py-2.5 px-4 sm:px-5">Date</th>
                      <th className="py-2.5 px-4 sm:px-5 text-center">Breakfast Checkbox</th>
                      <th className="py-2.5 px-4 sm:px-5 text-center">Lunch Checkbox</th>
                      <th className="py-2.5 px-4 sm:px-5 text-center">Dinner Checkbox</th>
                      <th className="py-2.5 px-4 sm:px-5 text-center">Select Specials</th>
                      <th className="py-2.5 px-4 sm:px-5 text-right">Daily Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-text-dark bg-white">
                    {memberMonthLoading ? (
                      <>
                        <TableRowSkeleton cols={6} />
                        <TableRowSkeleton cols={6} />
                        <TableRowSkeleton cols={6} />
                      </>
                    ) : (
                      memberMonthState.map((row, idx) => (
                        <tr key={row.date} className="hover:bg-primary-light/5 transition-colors">
                          <td className="py-2 px-4 sm:px-5 font-bold">
                            {row.date} {editingMonth.substring(0, 3)}
                          </td>
                          <td className="py-2 px-4 sm:px-5 text-center">
                            <input
                              type="checkbox"
                              checked={row.breakfast}
                              onChange={(e) => handleGridMealToggle(idx, "breakfast", e.target.checked)}
                              className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                            />
                          </td>
                          <td className="py-2 px-4 sm:px-5 text-center">
                            <input
                              type="checkbox"
                              checked={row.lunch}
                              onChange={(e) => handleGridMealToggle(idx, "lunch", e.target.checked)}
                              className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                            />
                          </td>
                          <td className="py-2 px-4 sm:px-5 text-center">
                            <input
                              type="checkbox"
                              checked={row.dinner}
                              onChange={(e) => handleGridMealToggle(idx, "dinner", e.target.checked)}
                              className="accent-primary h-4.5 w-4.5 cursor-pointer rounded"
                            />
                          </td>
                          <td className="py-2 px-4 sm:px-5 text-center">
                            <SpecialSelector
                              specials={specials}
                              selectedIds={row.specialIds}
                              onChange={(ids) => handleGridSpecialsChange(idx, ids)}
                              currency={currency}
                            />
                          </td>
                          <td className="py-2 px-4 sm:px-5 text-right font-extrabold text-text-dark font-sans">
                            {currency}{row.dailyTotal}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoices summaries */}
            {(() => {
              let mEaten = 0;
              let gTotal = 0;
              let sBills = 0;
              memberMonthState.forEach((r) => {
                if (r.breakfast) mEaten++;
                if (r.lunch) mEaten++;
                if (r.dinner) mEaten++;
                gTotal += r.dailyTotal;
                sBills += r.specialItems.reduce((sum, item) => sum + (item.price || 0), 0);
              });

              return (
                <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-text-gray block uppercase">Total Meals</span>
                    <span className="font-heading font-extrabold text-sm sm:text-base text-text-dark">{mEaten} Eaten</span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-text-gray block uppercase">Regular Menu</span>
                    <span className="font-heading font-extrabold text-sm sm:text-base text-text-dark">{currency}{gTotal - sBills}</span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-text-gray block uppercase">Specials Sum</span>
                    <span className="font-heading font-extrabold text-sm sm:text-base text-warning">{currency}{sBills}</span>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <span className="text-[9px] font-bold text-primary block uppercase">Grand Invoiced</span>
                    <span className="font-heading font-extrabold text-sm sm:text-base text-primary">{currency}{gTotal}</span>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  const records = memberMonthRecords || [];
                  // Reload grid to reset
                  triggerToast("Log grid reset to database values.", "warning");
                  handleEditMonthChange(editingMonth);
                }}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-text-gray rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Grid</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingMemberId(null); setActiveTab("dashboard"); }}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold text-text-gray bg-white hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMonthlyGrid}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Invoices</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SPECIALS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "specials" && (
          <SpecialsPage
            uid={adminUid}
            specials={specials}
            loading={specialsLoading}
            currency={currency}
            onToast={triggerToast}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 6: REPORTS */}
        {/* ======================================================== */}
        {activeTab === "reports" && (
          <ReportsPage
            adminUid={adminUid}
            members={members}
            mealPrices={mealPrices}
            currency={currency}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 7: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <SettingsPage
            uid={adminUid}
            settings={settings}
            loading={settingsLoading}
            currency={currency}
            onToast={triggerToast}
          />
        )}

      </main>
    </div>
  );
}
