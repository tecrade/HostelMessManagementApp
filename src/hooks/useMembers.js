import { useState, useEffect } from "react";
import { subscribeMembers } from "../firebase/firestore";

export const useMembers = (adminUid) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMembers(adminUid, (membersList) => {
      setMembers(membersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid]);

  return { members, loading };
};
