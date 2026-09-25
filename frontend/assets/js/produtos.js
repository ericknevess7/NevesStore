console.log("✅ Arquivo produtos.js carregado com bloqueio de tamanhos por cor e filtro de marcas!");

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. INJETAR O MODAL =====
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
              <h2 id="modal-product-title" style="font-size: 1.3rem; font-weight: 800; margin-bottom: 5px;">Nome</h2>
              <div class="prices" style="margin-bottom: 12px;">
                <span id="modal-product-old-price" class="old-price" style="text-decoration: line-through; color: #888; margin-right: 10px; font-size: 0.9rem;"></span>
                <span id="modal-product-price" class="current-price" style="font-size: 1.2rem; font-weight: 800; color: var(--accent, #a855f7);"></span>
              </div>
              
              <div id="color-selector-container" style="margin-bottom: 12px;">
                <p style="font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; color: var(--text-muted, #aaa);">VARIAÇÃO / COR SELECIONADA:</p>
                <div id="color-options-grid" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
              </div>

              <div id="size-selector-container" style="margin-bottom: 15px;">
                <p style="font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; color: var(--text-muted, #aaa);">TAMANHO:</p>
                <div id="size-options-grid" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
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

  // ===== Variáveis Globais =====
  window.currentProduct = null;
  window.activeVariants = [];
  window.currentIndex = 0;
  window.currentSize = null;

  // Lógica principal de atualização (Imagem, Cores e BLOQUEIO DE TAMANHOS)
  function updateModalImage(index) {
    if (window.activeVariants.length === 0) return;
    window.currentIndex = index;
    const variant = window.activeVariants[index];

    document.getElementById('modal-product-img').src = variant.img;
    if (window.currentProduct) {
      window.currentProduct.imgSrc = variant.img;
      window.currentProduct.cor = variant.cor;
    }

    // Borda na cor selecionada
    document.querySelectorAll('.color-thumb-btn').forEach((thumb, idx) => {
      thumb.style.border = idx === index ? '2px solid var(--accent, #a855f7)' : '2px solid transparent';
    });

    // MÁGICA: Verifica se a cor selecionada tem restrição de tamanho
    const tamanhosPermitidos = variant.tamanhos ? variant.tamanhos.split(',').map(s => s.trim()) : null;

    document.querySelectorAll('.size-btn').forEach(btn => {
      const tamanhoDoBotao = btn.getAttribute('data-size');

      if (tamanhosPermitidos && !tamanhosPermitidos.includes(tamanhoDoBotao)) {
        // Desabilita e risca o botão
        btn.style.opacity = '0.3';
        btn.style.textDecoration = 'line-through';
        btn.style.pointerEvents = 'none'; // Impede o clique
        
        // Se o cara tava com o 42 selecionado no Preto e mudou pro Rosa, reseta o tamanho
        if (window.currentSize === tamanhoDoBotao) {
          window.currentSize = null;
          btn.style.border = '2px solid transparent';
          btn.style.background = '#222';
          btn.style.color = '#fff';
        }
      } else {
        // Habilita normal
        btn.style.opacity = '1';
        btn.style.textDecoration = 'none';
        btn.style.pointerEvents = 'auto';
      }
    });
  }

  // ===== DELEGAÇÃO DE EVENTOS GLOBAL =====
  document.addEventListener('click', (e) => {
    
    // --- CLIQUE: ABRIR MODAL ("Ver Detalhes") ---
    const btnBuy = e.target.closest('.btn-buy');
    if (btnBuy && !btnBuy.hasAttribute('data-filtro')) { // Impede erro se for botão de filtro
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

      window.currentProduct = { title, imgSrc: window.activeVariants[0].img, price: currentPrice, cor: window.activeVariants[0].cor };

      document.getElementById('modal-product-title').innerText = title;
      document.getElementById('modal-product-old-price').innerText = oldPrice;
      document.getElementById('modal-product-price').innerText = currentPrice;

      const colorGrid = document.getElementById('color-options-grid');
      colorGrid.innerHTML = '';
      window.activeVariants.forEach((v, i) => {
        colorGrid.innerHTML += `
          <div class="color-thumb-btn" data-index="${i}" style="width: 42px; height: 42px; border-radius: 8px; overflow: hidden; cursor: pointer; background: #222;">
            <img src="${v.img}" alt="${v.cor}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      });

      // LÓGICA DE TAMANHOS GERAIS DO PRODUTO
      let productSizes = [];
      const pageUrl = window.location.pathname.toLowerCase();
      const tamanhosPersonalizados = btnBuy.getAttribute('data-sizes');

      if (tamanhosPersonalizados) {
        productSizes = tamanhosPersonalizados.split(',').map(t => t.trim());
      } else if (pageUrl.includes('camisetas') || pageUrl.includes('blusas') || pageUrl.includes('moletom')) {
        productSizes = ['P', 'M', 'G', 'GG']; 
      } else if (pageUrl.includes('acessorios') || pageUrl.includes('acessorio')) {
        productSizes = ['Único']; 
      } else {
        productSizes = ['38', '39', '40', '41', '42', '43']; 
      }

      const sizeGrid = document.getElementById('size-options-grid');
      sizeGrid.innerHTML = '';
      window.currentSize = null; 

      productSizes.forEach(sz => {
        sizeGrid.innerHTML += `<button type="button" class="size-btn" data-size="${sz}" style="min-width: 38px; padding: 0 10px; height: 38px; background: #222; color: #fff; border: 2px solid transparent; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">${sz}</button>`;
      });

      if (productSizes.length === 1) {
        window.currentSize = productSizes[0];
        setTimeout(() => {
          const onlyBtn = sizeGrid.querySelector('.size-btn');
          if(onlyBtn) {
            onlyBtn.style.border = '2px solid var(--accent, #a855f7)';
            onlyBtn.style.background = 'var(--accent, #a855f7)';
          }
        }, 50);
      }

      const prevBtn = document.getElementById('prev-img-btn');
      const nextBtn = document.getElementById('next-img-btn');
      if (window.activeVariants.length <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
      } else {
        if(prevBtn) prevBtn.style.display = 'flex';
        if(nextBtn) nextBtn.style.display = 'flex';
      }

      // Atualiza a imagem E checa os bloqueios de tamanho da primeira cor!
      updateModalImage(0);
      document.getElementById('product-details-modal').classList.add('active');
    }

    // --- CLIQUE: TROCAR COR ---
    const thumbBtn = e.target.closest('.color-thumb-btn');
    if (thumbBtn) {
      updateModalImage(parseInt(thumbBtn.getAttribute('data-index')));
    }

    // --- CLIQUE: ESCOLHER TAMANHO ---
    const sizeBtn = e.target.closest('.size-btn');
    if (sizeBtn) {
      window.currentSize = sizeBtn.getAttribute('data-size');
      
      document.querySelectorAll('.size-btn').forEach(btn => {
        btn.style.border = '2px solid transparent';
        btn.style.background = '#222';
        btn.style.color = '#fff';
      });

      sizeBtn.style.border = '2px solid var(--accent, #a855f7)';
      sizeBtn.style.background = 'var(--accent, #a855f7)';
      sizeBtn.style.color = '#fff';
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

    // --- CLIQUE: ADICIONAR AO CARRINHO ---
    if (e.target.closest('#btn-add-to-cart')) {
      e.preventDefault();

      if (!window.currentProduct) return;

      if (!window.currentSize) {
        alert("⚠️ Por favor, selecione um TAMANHO antes de adicionar ao carrinho!");
        return;
      }

      let carrinho = [];
      try {
        carrinho = JSON.parse(localStorage.getItem('carrinho'));
        if (!Array.isArray(carrinho)) carrinho = [];
      } catch (err) {
        carrinho = [];
      }

      const itemCarrinho = {
        title: `${window.currentProduct.title} (${window.currentProduct.cor})`,
        imgSrc: window.currentProduct.imgSrc,
        price: window.currentProduct.price,
        tamanho: window.currentSize
      };

      carrinho.push(itemCarrinho);
      localStorage.setItem('carrinho', JSON.stringify(carrinho));

      window.location.href = "carrinho.html";
    }
  });

  // Atualizar contador do carrinho
  let carrinhoAtual = [];
  try {
    carrinhoAtual = JSON.parse(localStorage.getItem('carrinho'));
    if (!Array.isArray(carrinhoAtual)) carrinhoAtual = [];
  } catch(e) {}
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.innerText = carrinhoAtual.length;

  // Nome do usuário
  try {
    const userStr = localStorage.getItem("usuario");
    const userLink = document.getElementById("user-profile-link");
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      const usuario = JSON.parse(userStr);
      const nomeUser = usuario?.nome || usuario?.name;
      if (nomeUser && userLink) {
        userLink.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: var(--accent, #a855f7);">👤 ${nomeUser}</span>`;
      }
    }
  } catch (err) {}

 // ===== NOVO: LÓGICA DE FILTRO DE MARCAS (CORRIGIDO E TURBINADO) =====
  function filtrarPorMarca() {
    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get('busca');
    const cardsProdutos = document.querySelectorAll('.product-card');

    if (termoBusca && cardsProdutos.length > 0) {
      cardsProdutos.forEach(card => {
        const marcaCard = card.getAttribute('data-marca');
        
        if (marcaCard && marcaCard.toLowerCase() === termoBusca.toLowerCase()) {
          card.style.display = 'block'; 
        } else {
          card.style.display = 'none'; 
        }
      });
    } else {
      // Se não tiver '?busca=' na URL (ex: acessou tenis.html direto), mostra todos!
      cardsProdutos.forEach(card => card.style.display = 'block');
    }
  }

  // Roda a função assim que a página abre
  filtrarPorMarca();

  // (Opcional, mas recomendado): Se tiveres botões de marca DENTRO da própria página de ténis, 
  // escuta se o usuário clica neles para filtrar sem ter que recarregar a página
 // (Opcional, mas recomendado): Atualiza sem refresh APENAS se já estiver na página de tênis!
  document.querySelectorAll('a[href^="tenis.html?busca="]').forEach(link => {
    link.addEventListener('click', function(e) {
      
      // Verifica se o usuário JÁ ESTÁ na página tenis.html
      if (window.location.pathname.includes('tenis.html')) {
        e.preventDefault(); // Impede o refresh SÓ AQUI
        
        const url = new URL(this.href, window.location.origin);
        const novaBusca = url.searchParams.get('busca');
        
        window.history.pushState({}, '', `tenis.html?busca=${novaBusca}`);
        filtrarPorMarca();
      }
      // Se ele estiver na index.html, o código ignora esse if e deixa o link funcionar normalmente!
    });
  });