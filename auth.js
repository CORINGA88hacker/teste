// auth.js (modificado)
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
    // Só redireciona se estiver na tela de login
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'admin.html';
    }
  } else {
    // Se estiver na tela de admin e não estiver logado, redireciona pra login
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = 'login.html';
    }
  }
});
