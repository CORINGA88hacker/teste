import { auth, db, ref, set, get, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from './firebase.js';

const btnLogout = document.getElementById('btnLogout');
const cursoForm = document.getElementById('cursoForm');
const aulaForm = document.getElementById('aulaForm');
const selectCurso = document.getElementById('selectCurso');
const listaCursos = document.getElementById('listaCursos');

const usuarioForm = document.getElementById('usuarioForm');
const usuarioEmail = document.getElementById('usuarioEmail');
const usuarioSenha = document.getElementById('usuarioSenha');
const usuarioValidade = document.getElementById('usuarioValidade');
const usuarioAdmin = document.getElementById('usuarioAdmin');

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
  carregarCursos();
});

btnLogout.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

cursoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = cursoForm.cursoTitulo.value.trim();
  const descricao = cursoForm.cursoDescricao.value.trim();
  const capa = cursoForm.cursoCapa.value.trim();

  if (!titulo || !descricao || !capa) {
    alert('Preencha todos os campos');
    return;
  }

  const idCurso = Date.now().toString();

  await set(ref(db, `cursosDetalhes/${idCurso}`), {
    titulo,
    descricao,
    capa,
    capitulos: {}
  });

  alert('Curso criado com sucesso!');
  cursoForm.reset();
  carregarCursos();
});

aulaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cursoId = selectCurso.value;
  const nome = aulaForm.aulaNome.value.trim();
  const linkPDF = aulaForm.aulaLinkPDF.value.trim();
  const disponivel = aulaForm.aulaDisponivel.checked;

  if (!cursoId || !nome || !linkPDF) {
    alert('Preencha todos os campos');
    return;
  }

  const idAula = Date.now().toString();
  const capRef = ref(db, `cursosDetalhes/${cursoId}/capitulos/${idAula}`);

  await set(capRef, {
    nome,
    linkPDF,
    disponivel
  });

  alert('Aula adicionada!');
  aulaForm.reset();
});

usuarioForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = usuarioEmail.value.trim();
  const senha = usuarioSenha.value.trim();
  const diasValidade = parseInt(usuarioValidade.value);
  const admin = usuarioAdmin.checked;

  if (!email || !senha || !diasValidade) {
    alert('Preencha todos os campos do usuário');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;
    const validadeTimestamp = Date.now() + diasValidade * 24 * 60 * 60 * 1000;

    await set(ref(db, 'usuarios/' + uid), {
      email,
      validade: validadeTimestamp,
      admin
    });

    alert('Usuário criado com sucesso!');
    usuarioForm.reset();
  } catch (err) {
    alert('Erro ao criar usuário: ' + err.message);
  }
});

async function carregarCursos() {
  selectCurso.innerHTML = '<option value="">Selecione o Curso</option>';
  listaCursos.innerHTML = '';

  const snap = await get(ref(db, 'cursosDetalhes'));
  if (!snap.exists()) return;

  const cursos = snap.val();

  for (const id in cursos) {
    const c = cursos[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = c.titulo;
    selectCurso.appendChild(option);

    const li = document.createElement('li');
    li.textContent = `${c.titulo} - ${c.descricao}`;
    listaCursos.appendChild(li);
  }
}
