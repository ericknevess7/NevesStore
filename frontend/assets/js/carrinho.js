console.log("✅ Arquivo carrinho.js carregado com tamanhos!");

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('carrinho-container');
  const totalEl = document.getElementById('total');
  const cartCountEl = document.getElementById('cart-count');

  // 1. CARREGAR CARRINHO
  let carrinho = [];
  try {
    carrinho = JSON.parse(localStorage.getItem('carrinho'));
    if (!Array.isArray(carrinho)) carrinho = [];
  } catch (err) {
    carrinho = [];
  }

  // 2. CALCULAR TOTAL
  function calcularTotal() {
    return carrinho.reduce((acc, item) => {
      let p = item.price || item.preco || "0";
      p = p.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      let valor = parseFloat(p) || 0;
      return acc + valor;
    }, 0);
  }

  // 3. RENDERIZAR OS ITENS NA TELA
  function renderCarrinho() {
    if (!container) return;
    container.innerHTML = '';
    
    if (carrinho.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fa-solid fa-cart-arrow-down" style="font-size: 55px; color: #444; margin-bottom: 20px;"></i>
          <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 10px;">Seu carrinho está vazio</h3>
          <p style="font-size: 1rem; color: #999; margin-bottom: 25px;">Adicione tênis e acessórios para continuar.</p>
          <a href="tenis.html" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, var(--accent, #a855f7), #ff1493); color: white; text-decoration: none; border-radius: 6px; font-weight: 800; text-transform: uppercase;">Ir para a Loja</a>
        </div>
      `;
      if (totalEl) totalEl.textContent = "Total: R$ 0,00";
      if (cartCountEl) cartCountEl.textContent = "0";
      return;
    }

    const total = calcularTotal();

    carrinho.forEach((item, index) => {
      const img = item.imgSrc || item.imagem || 'https://via.placeholder.com/100';
      const name = item.title || item.nome || 'Produto';
      const price = item.price || item.preco || 'R$ 0,00';
      
      // AQUI ESTÁ A CORREÇÃO: Cria a linha do tamanho se ele existir
      const tamanhoHTML = item.tamanho ? `<span style="display: block; color: #ccc; font-size: 0.9rem; margin-top: 5px;"><i class="fa-solid fa-ruler"></i> Tamanho: <strong>${item.tamanho}</strong></span>` : '';

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 15px; flex-wrap: wrap; gap: 15px; border: 1px solid #333;";

      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          <img src="${img}" alt="${name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #222;" onerror="this.src='https://via.placeholder.com/80'">
          <div>
            <strong style="color: #fff; font-size: 1.1rem; display: block; margin-bottom: 3px;">${name}</strong>
            <span style="color: var(--accent, #a855f7); font-weight: 800; font-size: 1.15rem;">${price}</span>
            ${tamanhoHTML}
          </div>
        </div>
        <button class="btn-remove" data-index="${index}" style="background: #dc2626; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
          <i class="fa-solid fa-trash"></i> Remover
        </button>
      `;
      container.appendChild(div);
    });

    // Função de clique no botão de Remover
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.closest('.btn-remove').getAttribute('data-index');
        removerItem(idx);
      });
    });

    // Atualiza contadores
    if (totalEl) totalEl.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    if (cartCountEl) cartCountEl.textContent = carrinho.length;
  }

  // 4. REMOVER ITEM E SALVAR
  function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderCarrinho();
  }

  // Inicializa a tela
  renderCarrinho();

  // ===== 5. FINALIZAR COMPRA - INTEGRAÇÃO MERCADO PAGO =====
  const btnFinalizar = document.getElementById('finalizar-compra');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
      if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
        return;
      }

      const nome = document.getElementById('nome')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const telefone = document.getElementById('telefone')?.value.trim();
      const endereco = document.getElementById('endereco')?.value.trim();

      if (!nome || !email || !telefone || !endereco) {
        alert("⚠️ Preencha todos os dados de entrega antes de finalizar.");
        return;
      }

      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) {
        alert("⚠️ E-mail inválido. Verifique e tente novamente.");
        return;
      }

      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10) {
        alert("⚠️ Telefone deve ter pelo menos 10 dígitos.");
        return;
      }

      const itensFormatados = carrinho.map(item => {
        let p = item.price || item.preco || "0";
        p = p.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        return {
          // Agora o nome do produto no Mercado Pago vai com a cor e o tamanho!
          title: `${item.title || item.nome} - Tam: ${item.tamanho || 'Único'}`,
          unit_price: parseFloat(p) || 0,
          quantity: 1
        };
      });

      try {
        btnFinalizar.innerText = "Processando...";
        btnFinalizar.style.opacity = "0.7";

        const response = await fetch('http://localhost:3000/api/checkout/processar-pagamento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itens: itensFormatados,
            comprador: { nome, email, telefone, endereco }
          })
        });

        const data = await response.json();

        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          alert("❌ Ocorreu um erro ao gerar o pagamento. Tente novamente.");
          btnFinalizar.innerText = "Finalizar Compra";
          btnFinalizar.style.opacity = "1";
        }
      } catch (error) {
        console.error('Erro na integração com o backend:', error);
        alert("⚠️ Não foi possível conectar ao servidor de pagamentos. Verifique se o backend Node.js está rodando.");
        btnFinalizar.innerText = "Finalizar Compra";
        btnFinalizar.style.opacity = "1";
      }
    });
  }

});