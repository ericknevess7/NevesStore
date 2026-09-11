document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. CRIAR E INJETAR MODAL DE DETALHES DO PRODUTO =====
  const productModalHTML = `
    <div id="product-details-modal" class="modal-overlay">
      <div class="modal-card product-modal-card">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 800;"><i class="fa-solid fa-box-open"></i> Detalhes do Produto</h3>
          <button id="btn-close-product-modal" class="modal-close">&times;</button>
        </div>
        <div class="product-modal-body">
          <div class="product-modal-image">
            <img id="modal-product-img" src="" alt="Produto">
          </div>
          <div class="product-modal-info">
            <h2 id="modal-product-title">Nome do Produto</h2>
            <div class="prices" style="margin: 15px 0;">
              <span id="modal-product-old-price" class="old-price"></span>
              <span id="modal-product-price" class="current-price"></span>
            </div>
            <p class="product-modal-desc">Produto exclusivo de altíssima qualidade com garantia de entrega e frete seguro Neves Store.</p>
            <button id="btn-add-to-cart" class="btn-hero" style="width: 100%; margin-top: 20px; border: none; cursor: pointer;">
              <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', productModalHTML);

  const productModal = document.getElementById('product-details-modal');
  const btnCloseProductModal = document.getElementById('btn-close-product-modal');
  const btnAddToCart = document.getElementById('btn-add-to-cart');
  let currentProduct = null;

  // Evento de clique no botão "Ver Detalhes"
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-buy')) {
      const card = e.target.closest('.product-card');
      if (!card) return;

      const title = card.querySelector('h3')?.innerText || 'Produto';
      const imgSrc = card.querySelector('.product-image-box img')?.src || '';
      const oldPrice = card.querySelector('.old-price')?.innerText || '';
      const currentPrice = card.querySelector('.current-price')?.innerText || '';

      currentProduct = { title, imgSrc, price: currentPrice };

      document.getElementById('modal-product-title').innerText = title;
      document.getElementById('modal-product-img').src = imgSrc;
      document.getElementById('modal-product-old-price').innerText = oldPrice;
      document.getElementById('modal-product-price').innerText = currentPrice;

      productModal.classList.add('active');
    }
  });

  // Fechar Modal do Produto
  btnCloseProductModal?.addEventListener('click', () => {
    productModal.classList.remove('active');
  });

  productModal?.addEventListener('click', (e) => {
    if (e.target === productModal) {
      productModal.classList.remove('active');
    }
  });

  // Adicionar Item ao Carrinho
  btnAddToCart?.addEventListener('click', () => {
    if (!currentProduct) return;

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.push(currentProduct);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = carrinho.length;

    alert(`✅ "${currentProduct.title}" adicionado ao seu carrinho!`);
    productModal.classList.remove('active');
  });

  // Atualiza a contagem inicial da sacola
  const carrinhoInicial = JSON.parse(localStorage.getItem('carrinho')) || [];
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.innerText = carrinhoInicial.length;


  // ===== 2. CONTROLE DO MODAL EXPLORAR CATÁLOGO (INDEX) =====
  const btnOpenCatalog = document.getElementById('btn-open-catalog');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const catalogModal = document.getElementById('catalog-modal');

  if (btnOpenCatalog && catalogModal) {
    btnOpenCatalog.addEventListener('click', () => {
      catalogModal.classList.add('active');
    });

    btnCloseModal?.addEventListener('click', () => {
      catalogModal.classList.remove('active');
    });

    catalogModal.addEventListener('click', (e) => {
      if (e.target === catalogModal) {
        catalogModal.classList.remove('active');
      }
    });
  }


  // ===== 3. FILTRO DE BUSCA POR PARÂMETRO DA URL (?busca=marca) =====
  const urlParams = new URLSearchParams(window.location.search);
  const termoBusca = urlParams.get('busca');

  if (termoBusca) {
    const termoMin = termoBusca.toLowerCase();
    
    // Altera o título da página para mostrar a busca
    const tituloPagina = document.querySelector('.section-title h2') || document.getElementById('page-title');
    if (tituloPagina) {
      tituloPagina.innerText = `RESULTADOS PARA "${termoBusca.toUpperCase()}"`;
    }

    // Filtra os cards de produto visíveis na tela (compara no nome e no alt da imagem)
    const produtos = document.querySelectorAll('.product-card');
    let encontrados = 0;

    produtos.forEach(card => {
      const nomeProduto = card.querySelector('h3')?.innerText.toLowerCase() || '';
      const altImagem = card.querySelector('img')?.alt.toLowerCase() || '';

      if (nomeProduto.includes(termoMin) || altImagem.includes(termoMin)) {
        card.style.display = 'flex';
        encontrados++;
      } else {
        card.style.display = 'none';
      }
    });

    // Exibe mensagem caso nenhum produto seja encontrado
    if (encontrados === 0) {
      const grid = document.querySelector('.produtos-grid') || document.getElementById('produtos-container');
      if (grid) {
        grid.innerHTML = `
          <p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px 0; font-weight: 700;">
            Nenhum produto encontrado para a marca <strong>"${termoBusca.toUpperCase()}"</strong>.
          </p>`;
      }
    }
  }

});