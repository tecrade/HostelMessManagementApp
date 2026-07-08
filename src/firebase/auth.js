import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { createMessCodeEntry } from "./messCode";

// Bootstrap Firestore profile and settings on sign up
export const signUpAdmin = async (email, password, name, messCode) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const upperCode = messCode.trim().toUpperCase();

  // Perform a batched write to bootstrap profile, settings, and messCode lookup
  const batch = writeBatch(db);

  // Profile document: admins/{uid}/profile/data
  const profileRef = doc(db, "admins", user.uid, "profile", "data");
  batch.set(profileRef, {
    name: name,
    email: email,
    messCode: upperCode,
    createdAt: serverTimestamp()
  });

  // Settings document: admins/{uid}/settings/data
  const settingsRef = doc(db, "admins", user.uid, "settings", "data");
  batch.set(settingsRef, {
    mealPrices: {
      breakfast: 50,
      lunch: 50,
      dinner: 50
    },
    currency: "₹",
    updatedAt: serverTimestamp()
  });

  // messCodes/{CODE} → adminUid lookup
  createMessCodeEntry(batch, upperCode, user.uid);

  await batch.commit();
  return user;
};

export const loginAdmin = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutAdmin = async () => {
  await signOut(auth);
};

export const resetAdminPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const changeAdminPassword = async (newPassword) => {
  const user = auth.currentUser;
  if (user) {
    await updatePassword(user, newPassword);
  } else {
    throw new Error("No admin is currently signed in.");
  }
};

export const changeAdminEmail = async (newEmail) => {
  const user = auth.currentUser;
  if (user) {
    await updateEmail(user, newEmail);
  } else {
    throw new Error("No admin is currently signed in.");
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
