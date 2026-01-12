// shared/admin_logger.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Log une action admin dans Firestore
 */
export async function logAdminAction({
  action,
  adminUid,
  adminEmail,
  annonceId = null,
  extra = {}
}) {
  try {
    await addDoc(collection(db, "admin_logs"), {
      action,
      adminUid,
      adminEmail,
      annonceId,
      extra,
      createdAt: serverTimestamp() // ✅ Timestamp Firestore PRO
    });
  } catch (err) {
    console.error("admin log error:", err);
  }
}
