import { useState, useEffect, useCallback } from "react";
import { resolveMessCode } from "../firebase/messCode";

const LS_CODE_KEY = "selectedMessCode";
const LS_UID_KEY = "resolvedAdminUid";

/**
 * useMessCode — manages student Mess Code access lifecycle.
 *
 * Returns:
 *   messCode          string | null   — the active Mess Code
 *   resolvedAdminUid  string | null   — the admin UID resolved from the code
 *   loading           bool            — true while restoring from localStorage or resolving
 *   error             string | null   — friendly error message
 *   submitMessCode    (code) => void  — validate & store a code entered by the student
 *   clearMessCode     () => void      — wipe localStorage & reset (Change Mess)
 */
export const useMessCode = () => {
  const [messCode, setMessCode] = useState(null);
  const [resolvedAdminUid, setResolvedAdminUid] = useState(null);
  const [loading, setLoading] = useState(true); // starts true while reading localStorage
  const [error, setError] = useState(null);

  // On mount: restore saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(LS_CODE_KEY);
    const savedUid = localStorage.getItem(LS_UID_KEY);
    if (savedCode && savedUid) {
      setMessCode(savedCode);
      setResolvedAdminUid(savedUid);
    }
    setLoading(false);
  }, []);

  /**
   * Resolve a Mess Code entered by the student.
   * Returns true on success, false on failure.
   */
  const submitMessCode = useCallback(async (rawCode) => {
    setError(null);
    setLoading(true);
    try {
      const { adminUid, code } = await resolveMessCode(rawCode);
      // Persist to localStorage
      localStorage.setItem(LS_CODE_KEY, code);
      localStorage.setItem(LS_UID_KEY, adminUid);
      setMessCode(code);
      setResolvedAdminUid(adminUid);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear stored Mess Code (Change Mess / logout student).
   */
  const clearMessCode = useCallback(() => {
    localStorage.removeItem(LS_CODE_KEY);
    localStorage.removeItem(LS_UID_KEY);
    setMessCode(null);
    setResolvedAdminUid(null);
    setError(null);
  }, []);

  return {
    messCode,
    resolvedAdminUid,
    loading,
    error,
    submitMessCode,
    clearMessCode
  };
};
