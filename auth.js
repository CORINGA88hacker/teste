import { auth, db, ref, get, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase.js';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'admin.html';
  } catch (err) {
    alert('Erro ao fazer login: ' + err.message);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await get(ref(db, 'usuarios/' + user.uid));
    if (!snap.exists()) {
      alert('Usuário não encontrado no banco');
      await signOut(auth);
      return;
    }
    const data = snap.val();
    const agora = Date.now();
    if (data.validade < agora) {
      alert('Sua conta expirou.');
      await signOut(auth);
      return;
    }
    if (window.location.pathname.endsWith('login.html')) {
      window.location.href = 'admin.html';
    }
  }
});
