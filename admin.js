import { auth, db, ref, get, onAuthStateChanged, signOut } from './firebase.js';

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const snap = await get(ref(db, 'usuarios/' + user.uid));
  if (!snap.exists()) {
    alert('Usuário não encontrado');
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  const data = snap.val();
  if (!data.admin) {
    alert('Acesso negado! Você não é admin.');
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  // Se chegou aqui, está tudo certo, é admin
  carregarCursos();
});
