import { db, auth } from "./firebase.js";
import { 
    collection, query, where, onSnapshot, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// 1. Initialisation de l'écouteur
onAuthStateChanged(auth, (user) => {
    if (user) {
        listenForNotifications(user.uid);
    }
});

function listenForNotifications(userId) {
    const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false)
    );

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const notif = change.doc.data();
                renderToast(change.doc.id, notif);
            }
        });
    });
}

function renderToast(id, notif) {
    // Injection des styles d'animation s'ils n'existent pas
    if (!document.getElementById("notif-styles")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "notif-styles";
        styleSheet.innerText = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(styleSheet);
    }

    const toast = document.createElement("div");
    const accentColor = notif.type === "success" ? "#22c55e" : "#ef4444";
    
    toast.style = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        width: 300px; border-left: 6px solid ${accentColor};
        background: #111827; color: white; padding: 16px;
        border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        animation: slideIn 0.4s ease-out; font-family: sans-serif;
    `;

    toast.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; display: flex; justify-content: space-between;">
            <span>${notif.title}</span>
        </div>
        <div style="font-size: 0.9em; margin-bottom: 12px; opacity: 0.8;">${notif.message}</div>
        <button id="btn-${id}" style="width: 100%; padding: 8px; background: ${accentColor}; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">
            J'ai compris
        </button>
    `;

    document.body.appendChild(toast);

    // Action au clic
    document.getElementById(`btn-${id}`).onclick = async () => {
        try {
            await updateDoc(doc(db, "notifications", id), { read: true });
            toast.style.animation = "slideOut 0.4s ease-in";
            setTimeout(() => toast.remove(), 350);
        } catch (error) {
            console.error("Erreur notification:", error);
            toast.remove();
        }
    };
}
