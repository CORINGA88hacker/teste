
/* Lógica mínima de chat que usa funções de firebase.js (stubs)
   Substitua os stubs com integrações reais no arquivo firebase.js */
async function sendMessage(){
  const text = document.getElementById('msgInput').value.trim();
  if(!text) return;
  await firebaseSendChatMessage({ text });
  document.getElementById('msgInput').value='';
  renderMessages(await firebaseFetchChatLive());
}
async function renderMessages(list){
  const container = document.getElementById('messages');
  container.innerHTML='';
  list.forEach(m => {
    const el = document.createElement('div');
    el.className='chat-message';
    el.innerHTML = `<img src="${m.photo||'personagem_05.png'}" class="mini"/> <strong>${m.user}</strong>: ${m.text}`;
    container.appendChild(el);
  });
  container.scrollTop = container.scrollHeight;
}
// Tentativa inicial de carregar mensagens
(async ()=>{ try{ const msgs = await firebaseFetchChatLive(); renderMessages(msgs); }catch(e){ console.log('chat load',e); } })();
