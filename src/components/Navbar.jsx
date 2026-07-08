import React from "react";
import { Search, Shield, User, LogOut, LayoutDashboard, Hash, Copy, RefreshCw } from "lucide-react";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  isAdmin,
  isStudentMode,
  messCode,
  onAdminClick,
  onLogout,
  onChangeMess,
  onBrandClick,
  currentView,
  setView,
  onOpenDrawer,
}) {
  const handleCopyCode = () => {
    if (messCode) {
      navigator.clipboard.writeText(messCode).catch(() => {});
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 py-3 flex items-center gap-3 transition-all duration-300">
      {/* Brand */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none group flex-shrink-0"
        onClick={onBrandClick}
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
          <span className="font-heading font-extrabold text-lg tracking-tight">M</span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-heading font-bold text-base text-text-dark tracking-tight leading-none group-hover:text-primary transition-colors duration-200">
            Mess Management
          </span>
          <span className="text-[10px] text-text-gray font-medium">Hostel Portal</span>
        </div>
      </div>

      {/* Search Bar (desktop only, home & admin views) */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4 relative">
        {(currentView === "home" || currentView === "admin-dashboard") && (
          <>
            <div className="absolute left-3.5 text-text-gray pointer-events-none">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-slate hover:bg-gray-100/70 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">

        {/* === ADMIN MODE === */}
        {isAdmin && (
          <>
            {/* Mess Code badge */}
            {messCode && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 border border-primary/15 rounded-xl">
                <Hash className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="font-heading font-bold text-xs text-primary tracking-widest">{messCode}</span>
                <button
                  onClick={handleCopyCode}
                  title="Copy Mess Code"
                  className="ml-0.5 text-primary/60 hover:text-primary transition-colors cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Toggle Admin Panel / Student View */}
            {currentView.startsWith("admin") ? (
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary-light hover:bg-primary/10 rounded-xl border border-primary/10 transition-all cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Student View</span>
              </button>
            ) : (
              <button
                onClick={() => setView("admin-dashboard")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}

            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-text-gray hover:text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}

        {/* === STUDENT MODE === */}
        {isStudentMode && !isAdmin && (
          <>
            {/* Active mess code badge */}
            {messCode && (
              <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 bg-success/8 border border-success/20 rounded-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
                <Hash className="h-3 w-3 text-success flex-shrink-0" />
                <span className="font-heading font-bold text-xs text-success tracking-widest">{messCode}</span>
              </div>
            )}

            {/* Change Mess button */}
            <button
              onClick={onChangeMess}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-gray hover:text-primary bg-white hover:bg-primary/5 border border-gray-200 hover:border-primary/20 rounded-xl transition-all cursor-pointer"
              title="Switch to a different mess"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Change Mess</span>
            </button>

            {/* Admin login link */}
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary-light hover:bg-primary/10 border border-primary/20 rounded-xl transition-all cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          </>
        )}

        {/* === UNAUTHENTICATED (no mess selected) === */}
        {!isAdmin && !isStudentMode && (
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary-light hover:bg-primary/10 border border-primary/20 rounded-xl transition-all cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Login</span>
          </button>
        )}

        {/* Separator */}
        <div className="h-7 w-px bg-gray-200 mx-0.5 hidden sm:block" />

        {/* User icon */}
        <div
          onClick={onBrandClick}
          className="h-8 w-8 rounded-xl bg-bg-slate border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer flex-shrink-0"
          title="Home"
        >
          <User className="h-4 w-4 text-text-dark/70" />
        </div>
      </div>
    </nav>
  );
}
