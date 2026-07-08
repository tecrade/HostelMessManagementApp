import { db } from "./config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

// --- Settings Helpers ---
export const subscribeSettings = (adminUid, callback) => {
  const ref = doc(db, "admins", adminUid, "settings", "data");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};

export const updateSettings = async (adminUid, settingsData) => {
  const ref = doc(db, "admins", adminUid, "settings", "data");
  await setDoc(ref, {
    ...settingsData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// --- Specials Helpers ---
export const subscribeSpecials = (adminUid, callback) => {
  const ref = collection(db, "admins", adminUid, "specials");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
};

export const addSpecial = async (adminUid, { name, price }) => {
  const ref = collection(db, "admins", adminUid, "specials");
  await addDoc(ref, {
    name,
    price: Number(price),
    enabled: true,
    createdAt: serverTimestamp()
  });
};

export const updateSpecial = async (adminUid, specialId, { name, price, enabled }) => {
  const ref = doc(db, "admins", adminUid, "specials", specialId);
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = Number(price);
  if (enabled !== undefined) updates.enabled = enabled;
  await updateDoc(ref, updates);
};

export const deleteSpecial = async (adminUid, specialId) => {
  const ref = doc(db, "admins", adminUid, "specials", specialId);
  await deleteDoc(ref);
};

// --- Members Helpers ---
export const subscribeMembers = (adminUid, callback) => {
  const ref = collection(db, "admins", adminUid, "members");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
};

export const addMember = async (adminUid, { name, email, phone, status }) => {
  const ref = collection(db, "admins", adminUid, "members");
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "M";

  await addDoc(ref, {
    name,
    email: email || "",
    phone: phone || "",
    status: status || "Active",
    avatar: initials,
    joinDate: serverTimestamp(),
    createdAt: serverTimestamp()
  });
};

export const updateMember = async (adminUid, memberId, { name, email, phone, status }) => {
  const ref = doc(db, "admins", adminUid, "members", memberId);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "M";

  await updateDoc(ref, {
    name,
    email: email || "",
    phone: phone || "",
    status: status || "Active",
    avatar: initials,
    updatedAt: serverTimestamp()
  });
};

export const deleteMember = async (adminUid, memberId) => {
  const ref = doc(db, "admins", adminUid, "members", memberId);
  await deleteDoc(ref);
};

// --- Attendance Helpers ---
// Subscribe to attendance for a specific date (Format YYYY-MM-DD)
export const subscribeDateAttendance = (adminUid, dateStr, callback) => {
  const ref = collection(db, "admins", adminUid, "attendance");
  const q = query(ref, where("date", "==", dateStr));
  return onSnapshot(q, (querySnapshot) => {
    const map = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      map[data.memberId] = { id: doc.id, ...data };
    });
    callback(map);
  });
};

// Subscribe to attendance for a specific member in a specific month (Format YYYY-MM)
export const subscribeMemberMonthAttendance = (adminUid, memberId, yearMonthStr, callback) => {
  const ref = collection(db, "admins", adminUid, "attendance");
  const q = query(
    ref,
    where("memberId", "==", memberId),
    where("month", "==", yearMonthStr)
  );
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
};

// Subscribe to all attendance records for a specific month (Format YYYY-MM) for reports/billing
export const subscribeMonthAttendance = (adminUid, yearMonthStr, callback) => {
  const ref = collection(db, "admins", adminUid, "attendance");
  const q = query(ref, where("month", "==", yearMonthStr));
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
};

// Subscribe to all attendance records for a specific member in a specific year (Format YYYY)
export const subscribeMemberYearAttendance = (adminUid, memberId, yearStr, callback) => {
  const ref = collection(db, "admins", adminUid, "attendance");
  // Query matches date strings starting with the year
  const q = query(
    ref,
    where("memberId", "==", memberId),
    where("date", ">=", `${yearStr}-01-01`),
    where("date", "<=", `${yearStr}-12-31`)
  );
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
};

// Save attendance for a single member on a specific day
export const saveSingleAttendance = async (adminUid, memberId, dateStr, record) => {
  const docId = `${dateStr}_${memberId}`;
  const ref = doc(db, "admins", adminUid, "attendance", docId);
  const [year, month] = dateStr.split("-");
  const monthStr = `${year}-${month}`; // Format YYYY-MM
  
  await setDoc(ref, {
    memberId,
    date: dateStr,
    month: monthStr,
    breakfast: !!record.breakfast,
    lunch: !!record.lunch,
    dinner: !!record.dinner,
    specialIds: record.specialIds || [],
    specialItems: record.specialItems || [], // [{ id, name, price }] snapshot
    dailyTotal: Number(record.dailyTotal || 0),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// Batch save attendance records (for bulk daily editing)
export const saveBulkAttendance = async (adminUid, dateStr, recordsMap) => {
  const batch = writeBatch(db);
  const [year, month] = dateStr.split("-");
  const monthStr = `${year}-${month}`; // Format YYYY-MM

  Object.entries(recordsMap).forEach(([memberId, record]) => {
    const docId = `${dateStr}_${memberId}`;
    const ref = doc(db, "admins", adminUid, "attendance", docId);
    batch.set(ref, {
      memberId,
      date: dateStr,
      month: monthStr,
      breakfast: !!record.breakfast,
      lunch: !!record.lunch,
      dinner: !!record.dinner,
      specialIds: record.specialIds || [],
      specialItems: record.specialItems || [],
      dailyTotal: Number(record.dailyTotal || 0),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
};
