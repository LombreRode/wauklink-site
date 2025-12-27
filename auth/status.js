import { auth } from "../_shared/firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const bar = document.createElement("div");
bar.id = "authBar";
bar.style.cssText = `
  position:fixed;
  top:12px;
  right:12px;
  z-index:9999;
  display:flex;
  gap:10px;
  align-items:center;
`;
document.body.appendChild(bar);

onAuthStateChanged(auth, (user) => {
  bar.innerHTML = "";

  if (!user) {
    bar.innerHTML = `<a href="/auth/login.html">Connexion</a>`;
    return;
  }

  const email = document.createElement("span");
  email.textContent = user.email;

  const logout = document.createElement("button");
  logout.textContent = "Déconnexion";
  logout.onclick = async () => {
    await signOut(auth);
    location.reload();
  };

  bar.append(email, logout);
});
