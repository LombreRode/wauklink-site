import { db } from "../../_shared/firebase.js";
import {
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function getActiveAnnonces(filters = {}){
  let conditions=[ where("status","==","active") ];

  if (filters.duree){
    conditions.push(where("duree","==",filters.duree));
  }

  const snap = await getDocs(
    query(collection(db,"annonces_location"), ...conditions)
  );

  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}
