import React, { useState, useEffect } from "react";
import { loginAdmin, signUpAdmin, resetAdminPassword } from "../firebase/auth";
import { isMessCodeAvailable, generateUniqueCode } from "../firebase/messCode";
import { Lock, Mail, User, Eye, EyeOff, X, Hash, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Login({ triggerToast, onClose }) {
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [messCode, setMessCode] = useState("");
  const [codeStatus, setCodeStatus] = useState("idle"); // "idle" | "checking" | "available" | "taken"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-generate a unique Mess Code when switching to sign-up
  useEffect(() => {
    if (authMode === "signup") {
      generateUniqueCode()
        .then((code) => {
          setMessCode(code);
          setCodeStatus("available");
        })
        .catch(() => {
          setMessCode("");
          setCodeStatus("idle");
        });
    } else {
      setMessCode("");
      setCodeStatus("idle");
    }
  }, [authMode]);

  // Validate Mess Code uniqueness on change (debounced)
  useEffect(() => {
    if (authMode !== "signup" || !messCode.trim()) {
      setCodeStatus("idle");
      return;
    }
    setCodeStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const available = await isMessCodeAvailable(messCode.trim());
        setCodeStatus(available ? "available" : "taken");
      } catch {
        setCodeStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [messCode, authMode]);

  const handleCodeChange = (e) => {
    setMessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, "").slice(0, 12));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerToast("Please enter a valid email address.", "warning");
      return;
    }

    setLoading(true);
    try {
      if (authMode === "login") {
        await loginAdmin(email.trim(), password);
        triggerToast("Signed in successfully!", "success");
        onClose?.();
      } else if (authMode === "signup") {
        if (!name.trim()) {
          triggerToast("Please enter your name.", "warning");
          return;
        }
        if (password.length < 6) {
          triggerToast("Password must be at least 6 characters.", "warning");
          return;
        }
        if (!messCode.trim()) {
          triggerToast("Please set a Mess Code for your portal.", "warning");
          return;
        }
        if (codeStatus === "taken") {
          triggerToast("That Mess Code is already taken. Please choose another.", "warning");
          return;
        }
        await signUpAdmin(email.trim(), password, name.trim(), messCode.trim());
        triggerToast("Registered and signed in successfully!", "success");
        onClose?.();
      } else if (authMode === "forgot") {
        await resetAdminPassword(email.trim());
        triggerToast("Password reset email sent. Please check your inbox.", "success");
        setAuthMode("login");
      }
    } catch (err) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === "auth/invalid-credential") {
        errMsg = "Invalid email address or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "An account with this email address already exists.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "The password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No admin account matches this email.";
      }
      triggerToast(errMsg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const codeStatusIcon = () => {
    if (codeStatus === "checking") return <Loader2 className="h-3.5 w-3.5 text-text-gray animate-spin" />;
    if (codeStatus === "available") return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    if (codeStatus === "taken") return <XCircle className="h-3.5 w-3.5 text-danger" />;
    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Glassmorphic card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6 sm:p-8 z-[10000] animate-slide-in my-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-text-gray hover:text-text-dark hover:bg-gray-100 transition-all duration-200 cursor-pointer z-20"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-heading font-black text-xl shadow-lg shadow-primary/10 mx-auto mb-3">
            M
          </div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-dark">
            {authMode === "login" && "Admin Access"}
            {authMode === "signup" && "Create Admin Account"}
            {authMode === "forgot" && "Recover Password"}
          </h2>
          <p className="text-xs text-text-gray mt-1 font-medium">
            {authMode === "login" && "Enter email and password to open the admin panel"}
            {authMode === "signup" && "Setup your independent mess portal"}
            {authMode === "forgot" && "Submit your email to receive a recovery link"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (signup only) */}
          {authMode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark/80 block">Custodian Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-gray">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-dark/80 block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-gray">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caretaker@hostel.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          {authMode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark/80 block">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-gray">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-gray hover:text-text-dark cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Mess Code (signup only) */}
          {authMode === "signup" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-dark/80 block">Mess Code</label>
                <span className="text-[10px] text-text-gray font-medium">Shared with your students</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-gray">
                  <Hash className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={messCode}
                  onChange={handleCodeChange}
                  placeholder="e.g. ABC123"
                  spellCheck={false}
                  className={`w-full pl-10 pr-10 py-2.5 font-heading font-bold tracking-widest text-sm rounded-xl border transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                    codeStatus === "taken"
                      ? "border-danger/50 focus:ring-danger/20 text-danger"
                      : codeStatus === "available"
                      ? "border-success/50 focus:ring-success/20 focus:border-success text-success"
                      : "border-gray-200 focus:ring-primary/20 focus:border-primary text-text-dark"
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {codeStatusIcon()}
                </span>
              </div>
              {codeStatus === "taken" && (
                <p className="text-[10px] text-danger font-medium">This code is already taken. Please choose another.</p>
              )}
              {codeStatus === "available" && (
                <p className="text-[10px] text-success font-medium">✓ This code is available!</p>
              )}
              <p className="text-[10px] text-text-gray">
                Auto-generated. You can customize it. Students will use this to access your mess.
              </p>
            </div>
          )}

          {/* Forgot password link */}
          {authMode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setAuthMode("forgot")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (authMode === "signup" && codeStatus === "taken")}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-75 text-sm font-bold text-white rounded-xl shadow-lg shadow-primary/10 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Sign In"
                : authMode === "signup"
                ? "Create Account & Mess"
                : "Reset Password"}
            </span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
          {authMode === "login" ? (
            <p className="text-xs text-text-gray font-medium">
              New custodian?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-text-gray font-medium">
              Have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
