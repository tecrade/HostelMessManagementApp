import { useState, useEffect } from "react";
import { subscribeSpecials } from "../firebase/firestore";

export const useSpecials = (adminUid) => {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid) {
      setSpecials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeSpecials(adminUid, (specialsList) => {
      setSpecials(specialsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid]);

  return { specials, loading };
};
