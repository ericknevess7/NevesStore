// ===== CARRINHO =====
const container = document.getElementById('carrinho-container');
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// CONFIGURAÇÃO: Coloque seu número de WhatsApp aqui (com DDD)
const NUMERO_WHATSAPP = "19999728998"; // Seu número configurado

function formatarPreco(preco) {
  const valor = parseFloat(preco.toString().replace('R$', '').replace(',', '.'));
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function calcularTotal() {
  return carrinho.reduce((acc, item) => {
    const valor = parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0;
    return acc + valor;
  }, 0);
}

function renderCarrinho() {
  container.innerHTML = '';
  const total = calcularTotal();

  if (carrinho.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <i class="fas fa-shopping-cart" style="font-size: 48px; color: #666; margin-bottom: 20px;"></i>
        <p style="font-size: 18px; color: #999;">Seu carrinho está vazio</p>
        <a href="tenis.html" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #8a2be2, #ff1493); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Continuar Comprando</a>
      </div>
    `;
    document.getElementById('total').textContent = "Total: R$ 0,00";
    document.getElementById('cart-count').textContent = "0";
    return;
  }

  carrinho.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');

    const img = `<img src="${item.imagem}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/100'" />`;
    const info = `
      <div class="cart-item-info">
        <strong>${item.nome}</strong>
        <span>Preço: ${item.preco}</span>
        ${item.tamanho ? `<span>Tamanho: ${item.tamanho}</span>` : ""}
        ${item.cor ? `<span>Cor: ${item.cor}</span>` : ""}
      </div>
    `;
    
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.onclick = () => removerItem(index);

    div.innerHTML = `<div>${img}${info}</div>`;
    div.appendChild(btn);
    container.appendChild(div);
  });

  const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
  document.getElementById('total').textContent = `Total: ${totalFormatado}`;
  document.getElementById('cart-count').textContent = carrinho.length;
}

function removerItem(index) {
  const itemRemovido = carrinho[index].nome;
  carrinho.splice(index, 1);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderCarrinho();
  console.log(`${itemRemovido} removido do carrinho`);
}

// ===== FINALIZAR COMPRA - REDIRECIONAR PARA WHATSAPP =====
document.getElementById('finalizar-compra').addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
    return;
  }

  // Pega os dados do formulário
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const endereco = document.getElementById('endereco').value.trim();

  if (!nome || !email || !telefone || !endereco) {
    alert("⚠️ Preencha todos os dados de entrega antes de finalizar.");
    return;
  }

  // Validar email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    alert("⚠️ E-mail inválido. Verifique e tente novamente.");
    return;
  }

  // Validar telefone (apenas números)
  const telefoneLimpo = telefone.replace(/\D/g, '');
  if (telefoneLimpo.length < 10) {
    alert("⚠️ Telefone deve ter pelo menos 10 dígitos.");
    return;
  }

  const totalCompra = calcularTotal();
  
  // Monta mensagem para WhatsApp
  const listaProdutos = carrinho
    .map(item => `${item.nome} - ${item.preco}${item.tamanho ? ` (Tam: ${item.tamanho})` : ''}`)
    .join('%0A');

  const mensagem = 
    `*NOVO PEDIDO - NEVES STORE*%0A%0A` +
    `👤 *Nome:* ${nome}%0A` +
    `📧 *E-mail:* ${email}%0A` +
    `📱 *Telefone:* ${telefone}%0A` +
    `📍 *Endereço:* ${endereco}%0A%0A` +
    `*Produtos:*%0A${listaProdutos}%0A%0A` +
    `💰 *Total:* R$ ${totalCompra.toFixed(2).replace('.', ',')}`;

  // Redireciona para WhatsApp
  const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}`;
  
  console.log('Abrindo WhatsApp com mensagem:', urlWhatsApp);
  
  // Abre WhatsApp em nova aba
  window.open(urlWhatsApp, '_blank');
  
  // Limpa o carrinho e o formulário
  alert('✅ Redirecionando para WhatsApp...\n\nSeu pedido foi preparado e será enviado via WhatsApp.');
  carrinho = [];
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  document.getElementById('checkoutForm').reset();
  renderCarrinho();
});

// Renderizar carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', renderCarrinho);
