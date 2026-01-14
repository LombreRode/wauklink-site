// shared/admin_logger.js
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
  if (!action || !adminUid) {
    console.warn("logAdminAction: paramètres manquants");
    return false;
  }

 try {
    // On crée une copie de extra en remplaçant les 'undefined' par 'null'
    const cleanExtra = {};
    if (extra) {
      for (const key in extra) {
        cleanExtra[key] = extra[key] === undefined ? null : extra[key];
      }
    }

    await addDoc(collection(db, "admin_logs"), {
      action,
      adminUid,
      adminEmail: adminEmail || null,
      annonceId: annonceId || null,
      extra: cleanExtra,
      createdAt: serverTimestamp()
    });
    return true;
  }
