// ── ESTADO ───────────────────────────────────────────────────
let roupas    = JSON.parse(localStorage.getItem("roupas_manu"))    || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos_manu")) || [];
let lookAtual  = null;
let filtroAtivo = 'todos';

const tipoLabel = { cima:'Top', baixo:'Bottom', inteiro:'Vestido', sapato:'Calçado', acessorio:'Acessório' };
const tipoEmoji = { cima:'👚', baixo:'👖', inteiro:'👗', sapato:'👠', acessorio:'💍' };

const frases = [
  "Você vai arrasar com esse look! 💅",
  "Perfeito pra brilhar hoje ✨",
  "Esse look tá um sonho 🌸",
  "Roupa arrumada, vida organizada 💖",
  "Look do dia aprovado! 👑",
  "Pronta pra conquistar o mundo 🌟"
];

// Inicialização
atualizarBadge();
renderFavoritos();

// ── TABS ──────────────────────────────────────────────────────
function abrirTab(tab, event) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + tab).classList.add('active');
  event.currentTarget.classList.add('active');

  if (tab === 'armario') renderArmario();
  if (tab === 'look')    renderFavoritos();
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── PREVIEW DE IMAGEM ─────────────────────────────────────────
function previewImagem(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const prev = document.getElementById('img-preview');
    prev.src = reader.result;
    prev.style.display = 'block';
    document.getElementById('upload-content').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── SALVAR ROUPA ──────────────────────────────────────────────
function salvarRoupa() {
  const nome   = document.getElementById("nome").value.trim();
  const cor    = document.getElementById("cor").value.trim();
  const tipo   = document.getElementById("tipo").value;
  const estilo = document.getElementById("estilo").value;
  const arquivo = document.getElementById("imagem").files[0];

  if (!nome) { showToast("⚠️ Coloca um nome na peça!"); return; }

  const salvar = (imgData) => {
    roupas.push({ id: Date.now(), nome, cor, tipo, estilo, imagem: imgData });
    localStorage.setItem("roupas_manu", JSON.stringify(roupas));
    atualizarBadge();
    showToast("💖 Peça salva no armário!");
    limparFormulario();
  };

  if (arquivo) {
    const reader = new FileReader();
    reader.onload = () => salvar(reader.result);
    reader.readAsDataURL(arquivo);
  } else {
    salvar(null);
  }
}

function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("cor").value  = "";
  document.getElementById("imagem").value = "";
  document.getElementById("img-preview").style.display = "none";
  document.getElementById("upload-content").style.display = "block";
}

// ── BADGE NO TAB ──────────────────────────────────────────────
function atualizarBadge() {
  const btn = document.getElementById('tab-armario');
  const old = btn.querySelector('.count-badge');
  if (old) old.remove();
  if (roupas.length > 0) {
    const b = document.createElement('span');
    b.className = 'count-badge';
    b.textContent = roupas.length;
    btn.appendChild(b);
  }
}

// ── RENDERIZAR ARMÁRIO ────────────────────────────────────────
function renderArmario() {
  renderStats();
  const grid  = document.getElementById('roupas-grid');
  const lista = filtroAtivo === 'todos'
    ? roupas
    : roupas.filter(r => r.tipo === filtroAtivo);

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">🧺</div>
        <p>Nenhuma peça aqui ainda! Vai lá cadastrar 💕</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map(r => `
    <div class="roupa-card">
      ${r.imagem
        ? `<img class="card-img" src="${r.imagem}" alt="${r.nome}">`
        : `<div class="card-img-placeholder">${tipoEmoji[r.tipo] || '👗'}</div>`}
      <button class="btn-delete" onclick="deletarRoupa(${r.id}, event)" title="Remover">✕</button>
      <div class="card-info">
        <div class="card-name">${r.nome}</div>
        <div class="card-tags">
          <span class="tag">${tipoLabel[r.tipo] || r.tipo}</span>
          <span class="tag">${r.estilo}</span>
          ${r.cor ? `<span class="tag">${r.cor}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function renderStats() {
  const area    = document.getElementById('stats-area');
  const total   = roupas.length;
  const tipos   = [...new Set(roupas.map(r => r.tipo))].length;
  const estilos = [...new Set(roupas.map(r => r.estilo))].length;
  const looks   = favoritos.length;

  area.innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Peças</div></div>
    <div class="stat-card"><div class="stat-num">${tipos}</div><div class="stat-label">Tipos</div></div>
    <div class="stat-card"><div class="stat-num">${estilos}</div><div class="stat-label">Estilos</div></div>
    <div class="stat-card"><div class="stat-num">${looks}</div><div class="stat-label">Looks Salvos</div></div>
  `;
}

function filtrarRoupas(tipo, el) {
  filtroAtivo = tipo;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderArmario();
}

function deletarRoupa(id, e) {
  e.stopPropagation();
  if (!confirm("Remover essa peça do armário?")) return;
  roupas = roupas.filter(r => r.id !== id);
  localStorage.setItem("roupas_manu", JSON.stringify(roupas));
  atualizarBadge();
  renderArmario();
  showToast("🗑️ Peça removida");
}

// ── GERAR LOOK ────────────────────────────────────────────────
function gerarLook() {
  const ocasiao  = document.getElementById("ocasiao").value;
  const filtradas = roupas.filter(r => r.estilo === ocasiao);

  if (filtradas.length === 0) {
    document.getElementById("resultado").innerHTML =
      `<div class="look-empty">😢 Nenhuma peça cadastrada pra <strong>${ocasiao}</strong>. Vai no armário e adiciona!</div>`;
    document.getElementById('btn-salvar-look').style.display = 'none';
    return;
  }

  // Sorteia 1 peça de cada tipo relevante
  const temInteiro = filtradas.some(r => r.tipo === 'inteiro');
  const tiposUsados = (temInteiro && Math.random() > 0.5)
    ? ['inteiro', 'sapato', 'acessorio']
    : ['cima', 'baixo', 'sapato', 'acessorio'];

  const lookPecas = [];
  tiposUsados.forEach(tipo => {
    const opcoes = filtradas.filter(r => r.tipo === tipo);
    if (opcoes.length > 0) {
      lookPecas.push(opcoes[Math.floor(Math.random() * opcoes.length)]);
    }
  });

  lookAtual = lookPecas;

  const frase = frases[Math.floor(Math.random() * frases.length)];
  const html = `
    <div class="look-cards">
      ${lookPecas.map(p => `
        <div class="look-card">
          ${p.imagem
            ? `<img src="${p.imagem}" alt="${p.nome}">`
            : `<div class="img-placeholder">${tipoEmoji[p.tipo] || '👗'}</div>`}
          <div class="look-card-label">
            <div class="piece-type">${tipoLabel[p.tipo] || p.tipo}</div>
            <div class="piece-name">${p.nome}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <p class="look-msg">${frase}</p>
  `;

  document.getElementById("resultado").innerHTML = html;
  document.getElementById('btn-salvar-look').style.display = 'inline-flex';

  // Mostra o box de análise da IA
  const iaBox = document.getElementById('ia-analise-box');
  iaBox.style.display = 'block';
  // Reseta a análise anterior
  document.getElementById('ia-analise-content').innerHTML = '<p style="color:#ad6887;font-style:italic">Clique em "Analisar esse look com IA" para receber uma análise personalizada 💕</p>';
  document.getElementById('btn-analisar').disabled = false;
  document.getElementById('btn-analisar').textContent = '🤖 Analisar esse look com IA';
}

// ── FAVORITOS ─────────────────────────────────────────────────
function salvarLookFavorito() {
  if (!lookAtual) return;
  const ocasiao = document.getElementById("ocasiao").value;
  favoritos.push({
    id: Date.now(),
    ocasiao,
    pecas: lookAtual,
    data: new Date().toLocaleDateString('pt-BR')
  });
  localStorage.setItem("favoritos_manu", JSON.stringify(favoritos));
  showToast("💖 Look salvo nos favoritos!");
  renderFavoritos();
}

function deletarFavorito(id) {
  favoritos = favoritos.filter(f => f.id !== id);
  localStorage.setItem("favoritos_manu", JSON.stringify(favoritos));
  renderFavoritos();
  showToast("🗑️ Look removido dos favoritos");
}

function renderFavoritos() {
  const lista = document.getElementById('favoritos-lista');
  if (favoritos.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <div class="icon">💔</div>
        <p>Nenhum look salvo ainda. Gera um look e salva! 💕</p>
      </div>`;
    return;
  }

  lista.innerHTML = favoritos.map(f => `
    <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #fce4ec;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <span class="tag" style="font-size:0.8rem">${f.ocasiao}</span>
          <span style="font-size:0.8rem;color:#ad6887;margin-left:8px">${f.data}</span>
        </div>
        <button onclick="deletarFavorito(${f.id})" style="background:none;border:none;cursor:pointer;color:#e91e63;font-size:1.1rem">🗑️</button>
      </div>
      <div class="look-cards" style="justify-content:flex-start">
        ${f.pecas.map(p => `
          <div class="look-card" style="width:130px">
            ${p.imagem
              ? `<img src="${p.imagem}" alt="${p.nome}" style="height:140px;object-fit:cover;width:100%">`
              : `<div class="img-placeholder" style="height:140px">${tipoEmoji[p.tipo] || '👗'}</div>`}
            <div class="look-card-label">
              <div class="piece-type">${tipoLabel[p.tipo] || p.tipo}</div>
              <div class="piece-name">${p.nome}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ── CONFIGURAÇÃO DA API KEY ───────────────────────────────────
function toggleApiConfig() {
  const body  = document.getElementById('api-config-body');
  const arrow = document.getElementById('api-arrow');
  body.classList.toggle('open');
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function salvarApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key.startsWith('sk-ant-')) {
    showToast('⚠️ Chave inválida! Deve começar com sk-ant-');
    return;
  }
  // Salva na sessionStorage (só dura enquanto o navegador está aberto — mais seguro)
  sessionStorage.setItem('claude_api_key', key);
  atualizarStatusApiUI(true);
  showToast('🔑 Chave salva! IA ativada 💖');
  document.getElementById('api-config-body').classList.remove('open');
  document.getElementById('api-arrow').style.transform = '';
}

function getApiKey() {
  return sessionStorage.getItem('claude_api_key');
}

function atualizarStatusApiUI(ativa) {
  const badge = document.getElementById('api-status-badge');
  if (ativa) {
    badge.textContent = '✓ Ativada';
    badge.className = 'api-badge api-badge--on';
    document.getElementById('api-key-info').textContent = '✓ Chave salva nesta sessão';
  } else {
    badge.textContent = 'Desativada';
    badge.className = 'api-badge api-badge--off';
  }
}

// Verifica se já tem chave ao carregar
window.addEventListener('load', () => {
  if (getApiKey()) atualizarStatusApiUI(true);
});

// ── ANÁLISE DO LOOK COM IA ────────────────────────────────────
async function analisarLookComIA() {
  const apiKey = getApiKey();
  if (!apiKey) {
    showToast('⚠️ Configure sua chave da API primeiro!');
    document.getElementById('api-config-body').classList.add('open');
    return;
  }
  if (!lookAtual || lookAtual.length === 0) {
    showToast('⚠️ Gera um look primeiro!');
    return;
  }

  const btn = document.getElementById('btn-analisar');
  const box = document.getElementById('ia-analise-content');

  btn.disabled = true;
  btn.textContent = '⏳ Analisando...';

  // Tela de loading
  box.innerHTML = `
    <div class="ia-loading">
      <div class="ia-dots">
        <span></span><span></span><span></span>
      </div>
      A IA está olhando suas peças e pensando no look...
    </div>`;

  // Monta o conteúdo para a API — texto + imagens (se tiver)
  const ocasiao = document.getElementById('ocasiao').value;

  // Conteúdo da mensagem para o Claude
  const conteudoMsg = [];

  // Texto descrevendo as peças
  const descricaoPecas = lookAtual.map(p =>
    `- ${tipoLabel[p.tipo] || p.tipo}: "${p.nome}"${p.cor ? ` (cor: ${p.cor})` : ''} [ocasião: ${p.estilo}]`
  ).join('\n');

  conteudoMsg.push({
    type: 'text',
    text: `Você é uma consultora de moda simpática, animada e divertida chamada Manu Style. Analise este look para a ocasião "${ocasiao}" composto pelas seguintes peças:\n\n${descricaoPecas}\n\n${lookAtual.some(p => p.imagem) ? 'As fotos das peças estão anexadas abaixo. Use as imagens para dar uma análise mais precisa das cores, estampas e texturas.' : ''}\n\nDê uma análise completa e animada em português do Brasil, abordando:\n1. 🎨 Harmonia de cores e como as peças combinam entre si\n2. ✨ Pontos fortes desse look para a ocasião escolhida\n3. 👠 Sugestão de complementos (acessórios, maquiagem, cabelo) que valorizariam ainda mais\n4. 💡 Uma dica rápida de como usar ou montar esse visual\n\nSeja carinhosa, use emojis e fale como se fosse uma amiga dando conselhos de moda. Máximo de 5 parágrafos curtos.`
  });

  // Adiciona imagens das peças que têm foto
  for (const peca of lookAtual) {
    if (peca.imagem) {
      // A imagem já está em base64, extrai o tipo e os dados
      const match = peca.imagem.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        conteudoMsg.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: match[1],
            data: match[2]
          }
        });
        conteudoMsg.push({
          type: 'text',
          text: `(foto da peça: ${peca.nome})`
        });
      }
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: conteudoMsg }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Erro na API');
    }

    const data = await response.json();
    const texto = data.content?.[0]?.text || 'Não consegui analisar 😢';

    // Formata a resposta em parágrafos
    const paragrafos = texto.trim().split('\n').filter(l => l.trim());
    box.innerHTML = `
      <div class="ia-resultado-text">
        ${paragrafos.map(p => `<p>${p}</p>`).join('')}
      </div>`;

  } catch (err) {
    console.error(err);
    if (err.message.includes('401') || err.message.includes('invalid')) {
      box.innerHTML = `<p style="color:#e91e63">❌ Chave de API inválida ou expirada. Verifique e tente novamente.</p>`;
      sessionStorage.removeItem('claude_api_key');
      atualizarStatusApiUI(false);
    } else {
      box.innerHTML = `<p style="color:#e91e63">❌ Erro ao conectar com a IA: ${err.message}</p>`;
    }
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 Analisar novamente';
  }
}