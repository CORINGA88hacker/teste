Jogo com Chat Global — instruções

O que fiz:
- index.html (novo): integra o seu jogo diretamente (conteúdo do seu HTML original foi copiado para orig_index.html) e mostra um chat global à direita.
- orig_index.html: cópia do arquivo HTML original do seu jogo (seu original não foi apagado).
- firebase.js: contém configuração do Firebase.
- Chat global usa Realtime Database em /global_chat/messages.
- Foto de perfil é opcional; se enviada, é armazenada em Firebase Storage e o link é salvo localmente no navegador.

Como testar localmente:
- Recomendo rodar um servidor local: python -m http.server 8000
- Abra http://localhost:8000 no navegador.
- Se o jogo dependia de caminhos relativos, mantive os arquivos no mesmo lugar para preservar referências.

Se quiser que eu injete alterações específicas no código do jogo (ex.: corrigir personagem flutuando, implementar opção 'chamar adulto' integrada), eu posso editar os arquivos de jogo diretamente.
