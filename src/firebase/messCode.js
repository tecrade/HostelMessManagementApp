import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

// --- Mess Code Helpers ---

/**
 * Resolve a Mess Code string to { adminUid }.
 * Throws an error if the code does not exist.
 */
export const resolveMessCode = async (rawCode) => {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new Error("Please enter a Mess Code.");

  const ref = doc(db, "messCodes", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error(`Mess Code "${code}" not found. Please check and try again.`);
  }
  const { adminUid } = snap.data();
  if (!adminUid) {
    throw new Error("This Mess Code is invalid. Please contact your administrator.");
  }
  return { adminUid, code };
};

/**
 * Check whether a Mess Code is available (not already taken).
 * Returns true if available.
 */
export const isMessCodeAvailable = async (rawCode) => {
  const code = rawCode.trim().toUpperCase();
  if (!code) return false;
  const ref = doc(db, "messCodes", code);
  const snap = await getDoc(ref);
  return !snap.exists();
};

/**
 * Create a Mess Code entry pointing to an adminUid.
 * Should only be called during admin sign-up (inside a batch).
 */
export const createMessCodeEntry = (batch, code, adminUid) => {
  const ref = doc(db, "messCodes", code.toUpperCase());
  batch.set(ref, {
    adminUid,
    createdAt: serverTimestamp()
  });
};

/**
 * Atomically replace an existing Mess Code with a new one for the same admin.
 * Deletes the old messCodes/{oldCode} doc and creates messCodes/{newCode}.
 * Also updates the admin's profile/data.messCode field.
 */
export const updateMessCode = async (adminUid, oldCode, newCode) => {
  const upperNew = newCode.trim().toUpperCase();
  const upperOld = oldCode.trim().toUpperCase();

  if (upperNew === upperOld) throw new Error("New code is the same as the current code.");

  // Check availability
  const available = await isMessCodeAvailable(upperNew);
  if (!available) throw new Error(`Mess Code "${upperNew}" is already taken. Please choose another.`);

  const batch = writeBatch(db);

  // Delete old code
  const oldRef = doc(db, "messCodes", upperOld);
  batch.delete(oldRef);

  // Create new code
  const newRef = doc(db, "messCodes", upperNew);
  batch.set(newRef, {
    adminUid,
    createdAt: serverTimestamp()
  });

  // Update admin profile
  const profileRef = doc(db, "admins", adminUid, "profile", "data");
  batch.update(profileRef, {
    messCode: upperNew,
    updatedAt: serverTimestamp()
  });

  await batch.commit();
  return upperNew;
};

/**
 * Generate a random unique Mess Code.
 * Retries up to 5 times to avoid collisions.
 */
export const generateUniqueCode = async () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusable chars (0,O,1,I)
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const available = await isMessCodeAvailable(code);
    if (available) return code;
  }
  throw new Error("Could not generate a unique Mess Code. Please try again.");
};
