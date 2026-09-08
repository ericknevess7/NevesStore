// ===== CARRINHO =====
const container = document.getElementById('carrinho-container');
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function formatarPreco(preco) {
  const valor = parseFloat(preco.toString().replace('R$', '').replace(',', '.'));
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function calcularTotal() {
  return carrinho.reduce((acc, item) => {
    // Tenta pegar de valorNumerico ou extrai da string preco
    const valor = item.valorNumerico || parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0;
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

    const img = `<img src="${item.imagem || ''}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/100'" />`;
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

// ===== FINALIZAR COMPRA - INTEGRADO AO BACKEND =====
document.getElementById('finalizar-compra').addEventListener('click', async () => {
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

  // Prepara os itens garantindo que valorNumerico existe
  const itensFormatados = carrinho.map(item => ({
    ...item,
    valorNumerico: item.valorNumerico || parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0
  }));

  try {
    const response = await fetch('http://localhost:3000/api/checkout/processar-pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itens: itensFormatados,
        comprador: {
          nome,
          email,
          telefone,
          endereco
        }
      })
    });

    const data = await response.json();

    if (data.init_point) {
      // Redireciona o cliente para o Checkout Transparente / Mercado Pago
      window.location.href = data.init_point;
    } else {
      alert("❌ Ocorreu um erro ao gerar o pagamento. Tente novamente.");
    }
  } catch (error) {
    console.error('Erro na integração com o backend:', error);
    alert("⚠️ Não foi possível conectar ao servidor de pagamentos. Verifique se o backend Node.js está rodando.");
  }
});

// Renderizar carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', renderCarrinho);