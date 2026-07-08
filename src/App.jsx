import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import MemberDetails from "./pages/MemberDetails";
import MonthlyDetails from "./pages/MonthlyDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import SelectMess from "./pages/SelectMess";

// Firebase Imports
import { db } from "./firebase/config";
import { logoutAdmin } from "./firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

// Custom Hooks
import { useAuth } from "./hooks/useAuth";
import { useMembers } from "./hooks/useMembers";
import { useSettings } from "./hooks/useSettings";
import { useSpecials } from "./hooks/useSpecials";
import { useMonthAttendance } from "./hooks/useAttendance";
import { useMessCode } from "./hooks/useMessCode";
import { PageLoader } from "./components/SkeletonLoader";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    messCode: studentMessCode,
    resolvedAdminUid,
    loading: messCodeLoading,
    error: messCodeError,
    submitMessCode,
    clearMessCode
  } = useMessCode();

  // --- Routing State ---
  // "home" | "member-details" | "monthly-details" | "login" | "admin-dashboard" | "select-mess"
  const [view, setView] = useState("home");

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  // Resolve which admin's data to show:
  //   - Admin mode: use the Firebase Auth UID
  //   - Student mode: use the Mess Code-resolved UID from localStorage
  const effectiveAdminUid = user ? user.uid : resolvedAdminUid;

  // Dynamic current month string (YYYY-MM)
  const currentMonthYearStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // --- Real-time Subscriptions (shared across admin & student mode) ---
  const { members, loading: membersLoading } = useMembers(effectiveAdminUid);
  const { specials, loading: specialsLoading } = useSpecials(effectiveAdminUid);
  const { settings, loading: settingsLoading } = useSettings(effectiveAdminUid);
  const { monthRecords, loading: attendanceLoading } = useMonthAttendance(effectiveAdminUid, currentMonthYearStr);

  // Group current-month records by memberId for Home card totals
  const groupedAttendance = useMemo(() => {
    const map = {};
    monthRecords.forEach((rec) => {
      if (!map[rec.memberId]) map[rec.memberId] = [];
      map[rec.memberId].push(rec);
    });
    return map;
  }, [monthRecords]);

  // Real-time Admin profile (name + messCode)
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!effectiveAdminUid) {
      setProfile(null);
      return;
    }
    const profileRef = doc(db, "admins", effectiveAdminUid, "profile", "data");
    const unsubscribe = onSnapshot(profileRef, (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
    });
    return () => unsubscribe();
  }, [effectiveAdminUid]);

  // Derived values
  const mealPrices = settings?.mealPrices || { breakfast: 50, lunch: 50, dinner: 50 };
  const currency = settings?.currency || "₹";
  const adminName = profile?.name || user?.email?.split("@")[0] || "Custodian";
  const activeMessCode = user ? profile?.messCode : studentMessCode; // shown in navbar

  // --- Routing logic ---

  // Wait for both auth and mess code localStorage restore to finish
  const appLoading = authLoading || messCodeLoading;

  useEffect(() => {
    if (appLoading) return;

    // Admin takes priority
    if (user) {
      // If admin was on select-mess (shouldn't happen), redirect home
      if (view === "select-mess") setView("home");
      return;
    }

    // No auth, no resolved student UID → need SelectMess
    if (!resolvedAdminUid) {
      setView("select-mess");
    } else {
      // Student has a stored code, go home if on select-mess
      if (view === "select-mess") setView("home");
    }
  }, [appLoading, user, resolvedAdminUid]);

  // Guard: unauthenticated user cannot reach admin-dashboard
  useEffect(() => {
    if (!authLoading && !user && view === "admin-dashboard") {
      setView("home");
    }
  }, [user, authLoading, view]);

  if (appLoading) return <PageLoader />;

  // --- Event Handlers ---
  const triggerToast = (message, type = "success") => setToast({ message, type });

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setView("home");
      triggerToast("Logged out successfully.", "warning");
    } catch (err) {
      triggerToast("Logout failed: " + err.message, "danger");
    }
  };

  const handleChangeMess = () => {
    clearMessCode();
    setView("select-mess");
  };

  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
    setView("member-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectMonth = (monthName, year) => {
    setSelectedMonth(monthName);
    setSelectedYear(year);
    setView("monthly-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    setSelectedMemberId(null);
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToMemberDetails = () => {
    setView("member-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrandClick = () => {
    if (!effectiveAdminUid) {
      setView("select-mess");
    } else {
      setView("home");
      setSelectedMemberId(null);
    }
  };

  // --- Student Mess Code submission handler ---
  const handleSubmitMessCode = async (code) => {
    const ok = await submitMessCode(code);
    if (ok) {
      setView("home");
      triggerToast("Connected to mess successfully!", "success");
    }
  };

  // Show SelectMess full-screen (no Navbar needed)
  if (view === "select-mess") {
    return (
      <>
        <SelectMess
          onSubmit={handleSubmitMessCode}
          loading={messCodeLoading}
          error={messCodeError}
          onAdminLogin={() => setView("login")}
          recentCode={studentMessCode}
        />
        {/* Login modal on top of SelectMess */}
        {view === "login" && (
          <Login
            triggerToast={triggerToast}
            onClose={() => setView("select-mess")}
          />
        )}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-bg-slate text-text-dark flex flex-col font-sans">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={!!user}
        isStudentMode={!user && !!resolvedAdminUid}
        messCode={activeMessCode}
        onAdminClick={() => setView("login")}
        onLogout={handleLogout}
        onChangeMess={handleChangeMess}
        onBrandClick={handleBrandClick}
        currentView={view}
        setView={setView}
        onOpenDrawer={() => setAdminDrawerOpen(true)}
      />

      {/* Primary body router */}
      <div className="flex-grow">
        {view === "home" && (
          <Home
            members={members}
            membersLoading={membersLoading}
            attendance={groupedAttendance}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectMember={handleSelectMember}
            currency={currency}
            onNavigateToAdmin={() => setView("admin-dashboard")}
            isAdmin={!!user}
          />
        )}

        {view === "member-details" && (
          <MemberDetails
            uid={effectiveAdminUid}
            memberId={selectedMemberId}
            members={members}
            currency={currency}
            onSelectMonth={handleSelectMonth}
            onBack={handleBackToHome}
          />
        )}

        {view === "monthly-details" && (
          <MonthlyDetails
            adminUid={effectiveAdminUid}
            memberId={selectedMemberId}
            members={members}
            monthName={selectedMonth}
            year={selectedYear}
            mealPrices={mealPrices}
            currency={currency}
            onBack={handleBackToMemberDetails}
          />
        )}

        {view === "login" && (
          <Login triggerToast={triggerToast} onClose={handleBackToHome} />
        )}

        {view === "admin-dashboard" && user && (
          <AdminDashboard
            adminUid={effectiveAdminUid}
            adminName={adminName}
            messCode={activeMessCode}
            members={members}
            membersLoading={membersLoading}
            specials={specials}
            specialsLoading={specialsLoading}
            settings={settings}
            settingsLoading={settingsLoading}
            mealPrices={mealPrices}
            currency={currency}
            onLogout={handleLogout}
            setView={setView}
            triggerToast={triggerToast}
            drawerOpen={adminDrawerOpen}
            setDrawerOpen={setAdminDrawerOpen}
          />
        )}
      </div>

      <footer className="py-6 border-t border-gray-200 bg-white/60 text-center text-[10px] text-text-gray font-bold uppercase tracking-wider">
        <span>Made With ❤️ By <a style={{ color: "#000", textDecoration: "underline" }} href="https://tecrade.github.io">Tecrade</a></span>
      </footer>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}
