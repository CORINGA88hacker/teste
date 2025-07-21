import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHIc2E4XwRO5FXo4uHlTQVRArOis73MjE",
  authDomain: "projeto-deus-yato-928-sk-default-rtdb.firebaseapp.com",
  databaseURL: "https://projeto-deus-yato-928-sk-default-rtdb.firebaseio.com",
  projectId: "projeto-deus-yato-928-sk-default-rtdb",
  storageBucket: "projeto-deus-yato-928-sk-default-rtdb.appspot.com",
  messagingSenderId: "790408726854",
  appId: "1:790408726854:android:e2f0de7b7d5dba96b0fd47"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get("curso");

if (!cursoId) {
  alert("Curso não especificado!");
}

const capaCurso = document.getElementById("capaCurso");
const tituloCurso = document.getElementById("tituloCurso");
const descricaoCurso = document.getElementById("descricaoCurso");
const listaCapitulos = document.getElementById("listaCapitulos");
const pdfViewer = document.getElementById("pdfViewer");

function getGoogleDriveViewerUrl(driveUrl) {
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = driveUrl.match(regex);
  if (!match) return null;
  const id = match[1];
  return `https://docs.google.com/gview?url=https://drive.google.com/uc?export=download&id=${id}&embedded=true`;
}

get(ref(db, `cursosDetalhes/${cursoId}`)).then((snapshot) => {
  if (snapshot.exists()) {
    const curso = snapshot.val();
    capaCurso.src = curso.capa;
    tituloCurso.textContent = curso.titulo;
    descricaoCurso.textContent = curso.descricao;
    listaCapitulos.innerHTML = "";
    for (const capKey in curso.capitulos) {
      const cap = curso.capitulos[capKey];
      const btn = document.createElement("button");
      btn.className = "capitulo-btn";
      btn.textContent = cap.nome;
      if (cap.disponivel) {
        btn.addEventListener("click", () => {
          const viewerUrl = getGoogleDriveViewerUrl(cap.linkPDF);
          if (!viewerUrl) {
            alert("Link do PDF inválido!");
            return;
          }
          pdfViewer.src = viewerUrl;
        });
      } else {
        btn.classList.add("indisponivel");
        btn.disabled = true;
      }
      listaCapitulos.appendChild(btn);
    }
  } else {
    alert("Curso não encontrado!");
  }
}).catch((error) => {
  console.error(error);
  alert("Erro ao buscar curso.");
});
