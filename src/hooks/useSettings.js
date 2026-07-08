import { useState, useEffect } from "react";
import { subscribeSettings } from "../firebase/firestore";

export const useSettings = (adminUid) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeSettings(adminUid, (settingsData) => {
      setSettings(settingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid]);

  return { settings, loading };
};
