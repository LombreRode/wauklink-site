import { db, auth, storage } from "/wauklink-site/shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const avatarImg = document.getElementById("avatarImg");
const emailDisplay = document.querySelector("#emailDisplay span");
const typeDisplay = document.querySelector("#typeDisplay span");
const reviewsList = document.getElementById("reviewsList");
const avgStars = document.getElementById("avgStars");
const avgCount = document.getElementById("avgCount");

onAuthStateChanged(auth, async (user) => {
    if (!user) return window.location.href = "/wauklink-site/auth/login.html";

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        emailDisplay.textContent = data.email || user.email;
        typeDisplay.textContent = data.role === "professionnel" ? "🚀 Pro" : "👤 Particulier";
        document.getElementById("firstNameInput").value = data.firstName || "";
        document.getElementById("phoneInput").value = data.phone || "";
        if (data.avatarUrl) avatarImg.src = data.avatarUrl;

        // Gestion Section Pro
        if (data.role !== "professionnel") {
            document.getElementById("proSection").classList.remove("hidden");
            const req = await getDoc(doc(db, "pro_requests", user.uid));
            if (req.exists()) {
                document.getElementById("proForm").classList.add("hidden");
                document.getElementById("proPending").classList.remove("hidden");
            }
        }
        loadUserReviews(user.uid);
    }
});

async function loadUserReviews(uid) {
    try {
        const q = query(collection(db, "reviews"), where("targetId", "==", uid), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
            reviewsList.innerHTML = "<p class='meta'>Aucun avis pour le moment.</p>";
            return;
        }
        let total = 0;
        reviewsList.innerHTML = "";
        snap.forEach(d => {
            const r = d.data();
            total += r.rating;
            reviewsList.innerHTML += `
                <div class="review-item">
                    <div style="color:#f1c40f">${"⭐".repeat(r.rating)}</div>
                    <p>${r.comment}</p>
                    <div class="meta">Le ${r.createdAt?.toDate().toLocaleDateString()}</div>
                </div>`;
        });
        const avg = (total / snap.size).toFixed(1);
        avgStars.textContent = "⭐".repeat(Math.round(avg)) + " " + avg + "/5";
        avgCount.textContent = `(${snap.size} avis)`;
    } catch (e) { console.error(e); }
}

// Upload Avatar
document.getElementById("avatarInput").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sRef = ref(storage, `avatars/${auth.currentUser.uid}`);
    const task = uploadBytesResumable(sRef, file);
    document.getElementById("progressContainer").style.display = "block";
    task.on('state_changed', 
        (s) => { document.getElementById("progressBar").style.width = (s.bytesTransferred / s.totalBytes) * 100 + "%"; },
        null, 
        async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarUrl: url });
            avatarImg.src = url;
            document.getElementById("avatarMsg").textContent = "✅ Mis à jour !";
        }
    );
};

// Sauvegarde Infos
document.getElementById("saveProfileBtn").onclick = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
        firstName: document.getElementById("firstNameInput").value,
        phone: document.getElementById("phoneInput").value
    });
    alert("Profil enregistré !");
};

// Envoi Dossier PRO
document.getElementById("btnSendPro").onclick = async () => {
    const file = document.getElementById("proDocInput").files[0];
    const bName = document.getElementById("businessName").value;
    const siret = document.getElementById("siret").value;
    if (!file || !bName || siret.length < 14) return alert("Complétez tous les champs.");

    const sRef = ref(storage, `pro_docs/${auth.currentUser.uid}_${file.name}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    await setDoc(doc(db, "pro_requests", auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        businessName: bName,
        siret: siret,
        docUrl: url,
        status: "pending",
        createdAt: serverTimestamp()
    });
    alert("Dossier envoyé !");
    location.reload();
};
