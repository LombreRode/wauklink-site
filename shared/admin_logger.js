import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Enregistre une action admin dans admin_logs
 */
export async function logAdminAction({
  action,
  adminUid,
  adminEmail,
  annonceId,
  extra = {}
}) {
  try {
    await addDoc(collection(db, "admin_logs"), {
      action,
      adminUid,
      adminEmail,
      annonceId,
      extra,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("admin_logger error:", err);
  }
}
