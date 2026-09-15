console.log("✅ Arquivo produtos.js carregado limpo e com redirecionamento!");

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. INJETAR O MODAL (se não existir) =====
  if (!document.getElementById('product-details-modal')) {
    const modalHTML = `
      <div id="product-details-modal" class="modal-overlay">
        <div class="modal-card product-modal-card" style="max-width: 650px; width: 90%;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; font-weight: 800;"><i class="fa-solid fa-box-open"></i> Detalhes do Produto</h3>
            <button id="btn-close-product-modal" class="modal-close" type="button">&times;</button>
          </div>
          <div class="product-modal-body" style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
            <div class="product-modal-image" style="position: relative; flex: 1; min-width: 250px; display: flex; justify-content: center; align-items: center; background: #1a1a1a; border-radius: 10px; overflow: hidden; height: 280px;">
              <button id="prev-img-btn" type="button" style="position: absolute; left: 10px; background: rgba(0,0,0,0.6); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1rem; z-index: 10;"><i class="fa-solid fa-chevron-left"></i></button>
              <img id="modal-product-img" src="" alt="Produto" style="width: 100%; height: 100%; object-fit: contain;">
              <button id="next-img-btn" type="button" style="position: absolute; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1rem; z-index: 10;"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="product-modal-info" style="flex: 1; min-width: 250px;">
              <h2 id="modal-product-title" style="font-size: 1.3rem; font-weight: 800; margin-bottom: 10px;">Nome</h2>
              <div class="prices" style="margin-bottom: 15px;">
                <span id="modal-product-old-price" class="old-price" style="text-decoration: line-through; color: #888; margin-right: 10px; font-size: 0.9rem;"></span>
                <span id="modal-product-price" class="current-price" style="font-size: 1.2rem; font-weight: 800; color: var(--accent, #a855f7);"></span>
              </div>
              <div id="color-selector-container" style="margin-bottom: 15px;">
                <p style="font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; color: var(--text-muted, #aaa);">VARIAÇÃO / COR SELECIONADA:</p>
                <div id="color-options-grid" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
              </div>
              <button id="btn-add-to-cart" type="button" class="btn-hero" style="width: 100%; padding: 12px; border: none; cursor: pointer; font-weight: 700; border-radius: 6px;">
                <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ===== Variáveis Globais do Modal =====
  window.currentProduct = null;
  window.activeVariants = [];
  window.currentIndex = 0;

  function updateModalImage(index) {
    if (window.activeVariants.length === 0) return;
    window.currentIndex = index;
    const variant = window.activeVariants[index];

    document.getElementById('modal-product-img').src = variant.img;
    if (window.currentProduct) {
      window.currentProduct.imgSrc = variant.img;
      window.currentProduct.cor = variant.cor;
    }

    // Atualiza a borda da miniatura selecionada
    document.querySelectorAll('.color-thumb-btn').forEach((thumb, idx) => {
      thumb.style.border = idx === index ? '2px solid var(--accent, #a855f7)' : '2px solid transparent';
    });
  }

  // ===== DELEGAÇÃO DE EVENTOS GLOBAL (Trata todos os cliques da página) =====
  document.addEventListener('click', (e) => {
    
    // --- CLIQUE: ABRIR MODAL ("Ver Detalhes") ---
    const btnBuy = e.target.closest('.btn-buy');
    if (btnBuy) {
      const card = btnBuy.closest('.product-card');
      if (!card) return;

      const title = card.querySelector('h3')?.innerText || 'Produto';
      const defaultImg = card.querySelector('.product-image-box img')?.src || '';
      const oldPrice = card.querySelector('.old-price')?.innerText || '';
      const currentPrice = card.querySelector('.current-price')?.innerText || '';

      try {
        const raw = btnBuy.getAttribute('data-variants');
        window.activeVariants = raw ? JSON.parse(raw) : [];
      } catch(err) {
        window.activeVariants = [];
      }

      if (window.activeVariants.length === 0) {
        window.activeVariants = [{ cor: "Padrão", img: defaultImg }];
      }

      window.currentProduct = { 
        title: title, 
        imgSrc: window.activeVariants[0].img, 
        price: currentPrice, 
        cor: window.activeVariants[0].cor 
      };

      document.getElementById('modal-product-title').innerText = title;
      document.getElementById('modal-product-old-price').innerText = oldPrice;
      document.getElementById('modal-product-price').innerText = currentPrice;

      const colorGrid = document.getElementById('color-options-grid');
      colorGrid.innerHTML = '';
      window.activeVariants.forEach((v, i) => {
        // Sem o onerror para evitar aquele loop infinito no console!
        colorGrid.innerHTML += `
          <div class="color-thumb-btn" data-index="${i}" style="width: 45px; height: 45px; border-radius: 8px; overflow: hidden; cursor: pointer; background: #222;">
            <img src="${v.img}" alt="${v.cor}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      });

      const prevBtn = document.getElementById('prev-img-btn');
      const nextBtn = document.getElementById('next-img-btn');
      if (window.activeVariants.length <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
      } else {
        if(prevBtn) prevBtn.style.display = 'flex';
        if(nextBtn) nextBtn.style.display = 'flex';
      }

      updateModalImage(0);
      document.getElementById('product-details-modal').classList.add('active');
    }

    // --- CLIQUE: TROCAR COR (Miniaturas no Modal) ---
    const thumbBtn = e.target.closest('.color-thumb-btn');
    if (thumbBtn) {
      updateModalImage(parseInt(thumbBtn.getAttribute('data-index')));
    }

    // --- CLIQUE: SETAS DO CARROSSEL ---
    if (e.target.closest('#prev-img-btn')) {
      let newIndex = window.currentIndex - 1;
      if (newIndex < 0) newIndex = window.activeVariants.length - 1;
      updateModalImage(newIndex);
    }
    if (e.target.closest('#next-img-btn')) {
      let newIndex = window.currentIndex + 1;
      if (newIndex >= window.activeVariants.length) newIndex = 0;
      updateModalImage(newIndex);
    }

    // --- CLIQUE: FECHAR MODAL ---
    const modalOverlay = document.getElementById('product-details-modal');
    if (e.target.closest('#btn-close-product-modal') || e.target === modalOverlay) {
      if (modalOverlay) modalOverlay.classList.remove('active');
    }

    // --- CLIQUE: ADICIONAR AO CARRINHO (Agora salva e redireciona!) ---
    if (e.target.closest('#btn-add-to-cart')) {
      e.preventDefault();

      if (!window.currentProduct) {
        console.log("Erro: Nenhum produto selecionado no modal.");
        return;
      }

      // 1. Puxa o carrinho do storage (se tiver quebrado, vira lista limpa)
      let carrinho = [];
      try {
        carrinho = JSON.parse(localStorage.getItem('carrinho'));
        if (!Array.isArray(carrinho)) carrinho = [];
      } catch (err) {
        carrinho = [];
      }

      // 2. Prepara o produto exatamente do jeito que o carrinho gosta
      const itemCarrinho = {
        title: `${window.currentProduct.title} (${window.currentProduct.cor})`,
        imgSrc: window.currentProduct.imgSrc,
        price: window.currentProduct.price
      };

      // 3. Salva no localStorage
      carrinho.push(itemCarrinho);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));

      console.log("Adicionado ao carrinho com sucesso:", itemCarrinho);

      // 4. Te joga direto para a página do carrinho!
      window.location.href = "carrinho.html";
    }
  });

  // ===== Atualizar contador do carrinho assim que a página carrega =====
  let carrinhoAtual = [];
  try {
    carrinhoAtual = JSON.parse(localStorage.getItem('carrinho'));
    if (!Array.isArray(carrinhoAtual)) carrinhoAtual = [];
  } catch(e) {
    carrinhoAtual = [];
  }
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.innerText = carrinhoAtual.length;

  // ===== Renderizar o NOME DO USUÁRIO de forma blindada =====
  try {
    const userStr = localStorage.getItem("usuario");
    const userLink = document.getElementById("user-profile-link");
    
    // Evita ler se o localStorage tiver a string corrompida "undefined"
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      const usuario = JSON.parse(userStr);
      const nomeUser = usuario?.nome || usuario?.name;
      
      // Só muda o HTML se realmente existir um nome
      if (nomeUser && userLink) {
        userLink.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: var(--accent, #a855f7);">👤 ${nomeUser}</span>`;
      }
    }
  } catch (err) {
    console.error("Erro ao puxar o usuário. O site não vai quebrar por isso.");
  }

  // ===== FILTRO DE BUSCA POR URL =====
  const termoBusca = new URLSearchParams(window.location.search).get('busca');
  if (termoBusca) {
    const termoMin = termoBusca.toLowerCase();
    const titulo = document.querySelector('.section-title h2');
    if (titulo) titulo.innerText = `RESULTADOS PARA "${termoBusca.toUpperCase()}"`;

    let achou = 0;
    document.querySelectorAll('.product-card').forEach(card => {
      const t = card.querySelector('h3')?.innerText.toLowerCase() || '';
      const a = card.querySelector('img')?.alt.toLowerCase() || '';
      if (t.includes(termoMin) || a.includes(termoMin)) {
        card.style.display = 'flex';
        achou++;
      } else {
        card.style.display = 'none';
      }
    });
    if (achou === 0) {
      const grid = document.querySelector('.produtos-grid');
      if (grid) grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#888;">Nenhum produto encontrado para <strong>"${termoBusca}"</strong>.</p>`;
    }
  }
});