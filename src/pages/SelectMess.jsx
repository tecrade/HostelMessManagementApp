import React, { useState, useEffect, useRef } from "react";
import { Hash, ArrowRight, Shield, Loader2, AlertCircle, Clock, ChevronRight } from "lucide-react";

export default function SelectMess({ onSubmit, loading, error, onAdminLogin, recentCode }) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code.trim());
  };

  const handleChange = (e) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, "").slice(0, 12));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/8 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md z-10 animate-slide-in">

        {/* Illustration header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-secondary shadow-xl shadow-primary/25 mb-4 relative">
            <span className="text-white font-heading font-extrabold text-4xl leading-none">M</span>
            {/* Floating badge */}
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-success flex items-center justify-center shadow-md">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-dark tracking-tight">
            Mess Management
          </h1>
          <p className="text-sm text-text-gray mt-1 font-medium">
            Enter your Mess Code to access your hostel portal
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-slate-200/60 p-7 sm:p-8">

          {/* Recent code suggestion */}
          {recentCode && !code && (
            <button
              type="button"
              onClick={() => onSubmit(recentCode)}
              className="w-full mb-5 flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-2xl transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-text-gray font-semibold uppercase tracking-wider">Continue with</p>
                  <p className="font-heading font-bold text-text-dark text-sm tracking-widest">{recentCode}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-dark/80 block mb-1.5 tracking-wide">
                MESS CODE
              </label>
              <div className={`relative transition-all duration-300 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray pointer-events-none">
                  <Hash className="h-4.5 w-4.5" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={handleChange}
                  placeholder="e.g. ABC123"
                  maxLength={12}
                  spellCheck={false}
                  autoCapitalize="characters"
                  autoComplete="off"
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-3.5 font-heading font-bold text-lg tracking-widest rounded-2xl border transition-all duration-200 bg-bg-slate focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:tracking-normal ${
                    error
                      ? "border-danger/50 focus:ring-danger/20 focus:border-danger text-danger"
                      : "border-gray-200 focus:ring-primary/20 focus:border-primary text-text-dark"
                  }`}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 mt-2.5 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-danger font-medium leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Connecting…</span>
                </>
              ) : (
                <>
                  <span>Access Mess Portal</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-semibold text-text-gray uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Admin login link */}
          <button
            type="button"
            onClick={onAdminLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-text-gray hover:text-primary border border-gray-200 hover:border-primary/20 hover:bg-primary/5 rounded-2xl transition-all duration-200 cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>I'm an Admin — Sign In</span>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-text-gray/60 mt-5 font-medium">
          Your Mess Code is provided by your hostel administrator.
        </p>
      </div>

      {/* CSS for shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
