// Protótipo de jogo 2D com múltipla escolha e progressão de cenários
let playerName = '';
let currentScenario = 1;
let totalScenarios = 36;
let characters = {};
let scenariosMap = {};
let playerState = {score:0};

async function loadJSON(path){
  const res = await fetch(path);
  return res.json();
}

function startGame(){
  playerName = document.getElementById('playerName').value.trim() || 'Player';
  document.getElementById('overlay-start').style.display='none';
  document.getElementById('bgMusic').play().catch(()=>{});
  renderScenario();
}

function renderScenario(){
  document.getElementById('currentNum').textContent = currentScenario;
  const sceneImg = document.getElementById('sceneImg');
  const sceneKey = `cenario_${String(currentScenario).padStart(2,'0')}`;
  sceneImg.src = `cenarios/${sceneKey}.png`;
  // clear characters
  const layer = document.getElementById('charactersLayer');
  layer.innerHTML = '';
  const chars = scenariosMap[sceneKey] || [];
  // place 2-3 characters evenly
  const gap = 100;
  const baseLeft = 50;
  chars.forEach((cid, idx) => {
    const el = document.createElement('img');
    el.className='char';
    el.style.left = (baseLeft + idx*220) + 'px';
    el.src = characters[cid].image;
    el.dataset.cid = cid;
    el.title = characters[cid].name;
    el.addEventListener('click', ()=> openDialogFor(cid));
    layer.appendChild(el);
  });
  // clear dialog
  document.getElementById('dialogText').textContent = 'Clique em um personagem para conversar.';
  document.getElementById('choices').innerHTML = '';
}

function openDialogFor(cid){
  const char = characters[cid];
  if(!char) return;
  // take first line available
  const line = char.lines[0];
  showLine(char, line);
}


function showLine(char, line){
  if(!line){
    // fallback: personagem sem fala
    const fb = `${char.name}: ...`;
    document.getElementById('dialogText').textContent = fb;
    addToHistory(char.name, '...');
    if(window.tts && window.tts.enabled) speak(fb);
    return;
  }

  const fullText = `${char.name}: ${line.text}`;
  document.getElementById('dialogText').textContent = fullText;
  addToHistory(char.name, line.text);
  // speak line if enabled
  if(window.tts && window.tts.enabled) speak(fullText);

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  (line.choices || []).forEach((ch, idx) => {
    const b = document.createElement('button');
    b.className='choiceBtn';
    b.textContent = ch.text;
    b.addEventListener('click', ()=>{
      // apply effects
      if(ch.effect && ch.effect.score) playerState.score += ch.effect.score;
      // feedback: show player's chosen response
      const playerMsg = `${playerName}: ${ch.text} (pontuação: ${playerState.score})`;
      document.getElementById('dialogText').textContent = playerMsg;
      addToHistory(playerName, ch.text);
      choicesDiv.innerHTML = '';
      // remove the current line from character lines (mark as answered)
      // but keep original lines for debugging by storing answered flag instead of shift
      if(!char._answered) char._answered = [];
      char._answered.push(line.id || line.text);
      // remove answered first occurrence from lines array
      if(char.lines && char.lines.length){
        const idxLine = char.lines.indexOf(line);
        if(idxLine !== -1) char.lines.splice(idxLine,1);
      }

      // if character has more lines, offer continue; else proceed button
      if(char.lines.length === 0){
        const cont = document.createElement('button');
        cont.textContent = 'Prosseguir';
        cont.className='choiceBtn';
        cont.addEventListener('click', ()=>{
          maybeAdvanceScenario();
        });
        choicesDiv.appendChild(cont);
      } else {
        const cont = document.createElement('button');
        cont.textContent = 'Continuar conversa';
        cont.className='choiceBtn';
        cont.addEventListener('click', ()=> showLine(char, char.lines[0]));
        choicesDiv.appendChild(cont);
      }
    });
    choicesDiv.appendChild(b);
  });

  // render history view (keeps recent messages visible)
  renderHistory();
}


function maybeAdvanceScenario(){
  // check if all characters in this scenario have empty lines
  const sceneKey = `cenario_${String(currentScenario).padStart(2,'0')}`;
  const chars = scenariosMap[sceneKey] || [];
  const allDone = chars.every(cid => (characters[cid].lines.length === 0));
  if(allDone){
    alert('Você completou este cenário! Avançando para o próximo.');
    currentScenario++;
    if(currentScenario > totalScenarios){
      alert('Parabéns! Você terminou todos os cenários. Pontuação final: ' + playerState.score);
      currentScenario = 1;
      // reset state (for demo)
      location.reload();
      return;
    }
    renderScenario();
  } else {
    alert('Ainda faltam personagens para conversar neste cenário.');
  }
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('nextScenario').addEventListener('click', ()=>{
  currentScenario++;
  if(currentScenario > totalScenarios) currentScenario = 1;
  renderScenario();
});

// load JSON data

// ---- TTS & diálogo histórico helpers ----
window.tts = {enabled: true, voiceURI: null, rate: 1, pitch: 1, volume: 1};
window.dialogHistory = []; // {who, text, time}

function addToHistory(who, text){
  window.dialogHistory.push({who, text, time: new Date().toISOString()});
  // keep history to last 100 entries
  if(window.dialogHistory.length > 100) window.dialogHistory.shift();
}

function renderHistory(){
  const h = document.getElementById('dialogHistory');
  if(!h) return;
  h.innerHTML = '';
  // show last 8 messages reversed
  const slice = window.dialogHistory.slice(-8);
  slice.forEach(it => {
    const d = document.createElement('div');
    d.className = 'histItem';
    d.textContent = `${it.who}: ${it.text}`;
    h.appendChild(d);
  });
  h.scrollTop = h.scrollHeight;
}

function speak(text){
  if(!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  // find voice by URI if set
  const voices = window.speechSynthesis.getVoices() || [];
  if(window.tts.voiceURI){
    const v = voices.find(x=>x.voiceURI===window.tts.voiceURI || x.name===window.tts.voiceURI);
    if(v) utter.voice = v;
  }
  utter.rate = window.tts.rate || 1;
  utter.pitch = window.tts.pitch || 1;
  utter.volume = window.tts.volume || 1;
  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(utter);
}

// populate voice selector if present
function populateVoices(){
  const sel = document.getElementById('voiceSelect');
  if(!sel || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  sel.innerHTML = '';
  voices.forEach(v=>{
    const o = document.createElement('option');
    o.value = v.voiceURI || v.name;
    o.textContent = `${v.name} ${v.lang ? '('+v.lang+')' : ''}`;
    sel.appendChild(o);
  });
  // select previously chosen if exists
  if(window.tts.voiceURI){
    sel.value = window.tts.voiceURI;
  }
}

if('speechSynthesis' in window){
  window.speechSynthesis.onvoiceschanged = populateVoices;
  // try immediate populate
  setTimeout(populateVoices, 200);
}

// setup controls listeners (if elements exist)
function setupTTSControls(){
  const toggle = document.getElementById('ttsToggle');
  const rate = document.getElementById('ttsRate');
  const pitch = document.getElementById('ttsPitch');
  const volume = document.getElementById('ttsVolume');
  const sel = document.getElementById('voiceSelect');
  if(toggle) toggle.addEventListener('click', ()=> {
    window.tts.enabled = !window.tts.enabled;
    toggle.textContent = window.tts.enabled ? 'TTS: ON' : 'TTS: OFF';
  });
  if(rate) rate.addEventListener('change', ()=> window.tts.rate = parseFloat(rate.value));
  if(pitch) pitch.addEventListener('change', ()=> window.tts.pitch = parseFloat(pitch.value));
  if(volume) volume.addEventListener('change', ()=> window.tts.volume = parseFloat(volume.value));
  if(sel) sel.addEventListener('change', ()=> window.tts.voiceURI = sel.value);
}

// call setup after DOM loaded
document.addEventListener('DOMContentLoaded', ()=>{
  setupTTSControls();
  renderHistory();
});
// ---- end helpers ----


Promise.all([loadJSON('personagens.json'), loadJSON('cenarios_map.json')]).then(([p,c])=>{
  characters = p;
  scenariosMap = c;
  // map image paths (they are relative)
  for(const k in characters){
    // already contains relative path "personagem/..."
  }
}).catch(e=>{console.error(e); alert('Erro ao carregar dados. Verifique arquivos JSON.')});
