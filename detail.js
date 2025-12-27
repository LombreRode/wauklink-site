import { auth, db } from "./_shared/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

(() => {
  // ---------- DOM ----------
  const titleEl = document.getElementById("title");
  const segmentEl = document.getElementById("segment");
  const descEl = document.getElementById("desc");
  const iconEl = document.getElementById("icon");
  const noteEl = document.getElementById("note");
  const statusLine = document.getElementById("statusLine");
  const btnMail = document.getElementById("btnMail");
  const btnCall = document.getElementById("btnCall");
  const btnReport = document.getElementById("btnReport");
  const btnEditPhotos = document.getElementById("btnEditPhotos");
  const form = document.getElementById("form");

  function setText(el, t){ if(el) el.textContent = t ?? ""; }
  function setHidden(el, hide){ if(el) el.classList.toggle("hidden", !!hide); }

  // ---------- URL ----------
  const params = new URLSearchParams(location.search);
  const annonceId = params.get("id");
  const serviceKey = params.get("service");

  // ---------- Helpers ----------
  function ownerUid(data){
    return data?.ownerUid || data?.ownerId || "";
  }

  async function loadRole(uid){
    const snap = await getDoc(doc(db,"users",uid));
    return snap.exists() ? String(snap.data().role || "").toLowerCase() : "";
  }

  async function loadAnnonce(id){
    const snap = await getDoc(doc(db,"annonces_location",id));
    if(!snap.exists()) throw new Error("Annonce introuvable");
    return snap.data();
  }

  function canEditPhotos(a,u,r){
    if(!a || !u) return false;
    if(a.status !== "active") return false;
    return ownerUid(a)===u.uid || r==="admin" || r==="moderator";
  }

  // ---------- MODE SERVICE ----------
  const services = [
    { key:"locataire", title:"Locataire", segment:"BESOIN", desc:"Demande de service", icon:"images/locataire.svg" },
    { key:"annonce", title:"Déposer vos annonces", segment:"PROPRIÉTAIRE", desc:"Annonce propriétaire", icon:"images/proprietaire-annonce.svg" },
    { key:"conciergerie", title:"Conciergerie", segment:"AIRBNB", desc:"Gestion & accueil", icon:"images/conciergerie.svg" },
    { key:"photographe", title:"Photographe pro", segment:"AIRBNB", desc:"Photos immobilières", icon:"images/photographe.svg" }
  ];

  function renderService(key){
    const s = services.find(x=>x.key===key) || services[0];
    setText(titleEl,s.title);
    setText(segmentEl,s.segment);
    setText(descEl,s.desc);
    iconEl.src=s.icon;
    setHidden(btnEditPhotos,true);
    btnMail.style.pointerEvents="none";
    btnCall.style.pointerEvents="none";
    btnReport.onclick=()=>setText(noteEl,"✅ Signalement reçu.");
    form.onsubmit=e=>{
      e.preventDefault();
      setText(noteEl,"✅ Demande envoyée.");
      form.reset();
    };
  }

  // ---------- MODE ANNONCE ----------
  async function renderAnnonce(a,user,role){
    setText(titleEl,a.titre);
    setText(segmentEl,a.ville);
    setText(descEl,a.description);
    iconEl.src=a.photos?.[0] || "images/proprietaire-annonce.svg";
    setText(statusLine,"status: "+a.status);

    btnMail.href=a.contactEmail?`mailto:${a.contactEmail}`:"#";
    btnCall.href=a.contactPhone?`tel:${a.contactPhone}`:"#";

    const canEdit = canEditPhotos(a,user,role);
    setHidden(btnEditPhotos,!canEdit);
    btnEditPhotos.href=`annonce_edit.html?id=${annonceId}`;

    btnReport.onclick=async()=>{
      await addDoc(collection(db,"reports"),{
        annonceId,
        createdAt:serverTimestamp(),
        reporterUid:user?.uid||null,
        status:"new"
      });
      setText(noteEl,"✅ Signalement envoyé.");
    };

    form.onsubmit=e=>{
      e.preventDefault();
      const msg=document.getElementById("msg").value;
      location.href=`mailto:${a.contactEmail}?subject=WAUKLINK&body=${encodeURIComponent(msg)}`;
    };
  }

  // ---------- BOOT ----------
  onAuthStateChanged(auth,async user=>{
    if(annonceId){
      const role=user?await loadRole(user.uid):"";
      try{
        const a=await loadAnnonce(annonceId);
        renderAnnonce(a,user,role);
      }catch(e){
        setText(titleEl,"Erreur");
        setText(descEl,e.message);
      }
    }else{
      renderService(serviceKey||"locataire");
    }
  });
})();
