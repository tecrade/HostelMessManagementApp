import React, { useEffect } from "react";
import { X, LayoutDashboard, UserPlus, CheckSquare, BarChart3, Settings, LogOut, Sparkles } from "lucide-react";

export default function MobileDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onLogout,
  adminName
}) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "members", label: "Add New Member", icon: UserPlus },
    { id: "attendance", label: "Daily Attendance", icon: CheckSquare },
    { id: "specials", label: "Special Items", icon: Sparkles },
    { id: "reports", label: "Statistics Reports", icon: BarChart3 },
    { id: "settings", label: "Meal Settings", icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl z-10 animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-150">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-dark leading-none">Caretaker</h4>
              <span className="text-[9px] text-text-gray font-bold tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-text-gray cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Profile Card if name provided */}
        {adminName && (
          <div className="p-4 border-b border-gray-100 bg-primary-light/10">
            <p className="text-xs font-bold text-text-dark">Signed in as:</p>
            <p className="text-xs text-primary font-bold mt-0.5 truncate">{adminName}</p>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer text-left ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-text-gray hover:text-text-dark hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-danger hover:bg-danger/10 transition-all cursor-pointer text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
