import { useState, useEffect } from "react";
import {
  subscribeDateAttendance,
  subscribeMemberMonthAttendance,
  subscribeMonthAttendance,
  subscribeMemberYearAttendance
} from "../firebase/firestore";

// Listen to attendance map for a single date: returns map of memberId -> record
export const useDateAttendance = (adminUid, dateStr) => {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid || !dateStr) {
      setAttendanceMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeDateAttendance(adminUid, dateStr, (map) => {
      setAttendanceMap(map);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid, dateStr]);

  return { attendanceMap, loading };
};

// Listen to a single member's attendance records in a month: returns array of records
export const useMemberMonthAttendance = (adminUid, memberId, yearMonthStr) => {
  const [memberMonthRecords, setMemberMonthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid || !memberId || !yearMonthStr) {
      setMemberMonthRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMemberMonthAttendance(adminUid, memberId, yearMonthStr, (records) => {
      setMemberMonthRecords(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid, memberId, yearMonthStr]);

  return { memberMonthRecords, loading };
};

// Listen to all attendance records in a month (Format YYYY-MM)
export const useMonthAttendance = (adminUid, yearMonthStr) => {
  const [monthRecords, setMonthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid || !yearMonthStr) {
      setMonthRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMonthAttendance(adminUid, yearMonthStr, (records) => {
      setMonthRecords(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid, yearMonthStr]);

  return { monthRecords, loading };
};

// Listen to a single member's attendance across a year (Format YYYY)
export const useMemberYearAttendance = (adminUid, memberId, yearStr) => {
  const [memberYearRecords, setMemberYearRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid || !memberId || !yearStr) {
      setMemberYearRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMemberYearAttendance(adminUid, memberId, yearStr, (records) => {
      setMemberYearRecords(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUid, memberId, yearStr]);

  return { memberYearRecords, loading };
};
