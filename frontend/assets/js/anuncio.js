// ===== Redirecionamento "Comprar Agora" no carrossel - REMOVIDO MERCADO PAGO =====
// Agora usa a mesma funcionalidade de adicionar ao carrinho que os produtos

// ===== Toggle do menu mobile =====
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('show');
});

// ===== Carrossel =====
const carouselItems = document.querySelectorAll('.product-details');
let currentIndex = 0;

function showItem(index) {
  carouselItems.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

document.getElementById('prevBtn').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
  showItem(currentIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % carouselItems.length;
  showItem(currentIndex);
});

showItem(currentIndex);

// ===== Carrinho com LocalStorage =====
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarContadorCarrinho() {
  const contador = document.getElementById('cart-count');
  if (contador) contador.textContent = carrinho.length;
}
atualizarContadorCarrinho();

function adicionarAoCarrinho(nome, preco, cor = null, tamanho = null) {
  const precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
  const produto = { nome, preco: precoFormatado, valorNumerico: preco, cor, tamanho, imagem: null };
  carrinho.push(produto);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  alert(`✅ ${nome} foi adicionado ao carrinho!`);
}

// ===== Botão carrinho =====
document.getElementById('cart-button')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'carrinho.html';
});

// ===== Contagem regressiva =====
function iniciarContagemRegressiva() {
  const countdowns = document.querySelectorAll('.countdown');
  countdowns.forEach(cd => {
    const dataFim = new Date(cd.getAttribute('data-time')).getTime();
    const timerEl = cd.querySelector('.timer');
    const intervalo = setInterval(() => {
      const agora = new Date().getTime();
      const diff = dataFim - agora;
      if (diff <= 0) {
        timerEl.textContent = '00:00:00';
        clearInterval(intervalo);
        return;
      }
      const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);
      timerEl.textContent =
        String(horas).padStart(2, '0') + ':' +
        String(minutos).padStart(2, '0') + ':' +
        String(segundos).padStart(2, '0');
    }, 1000);
  });
}
iniciarContagemRegressiva();


// ===== Painel lateral para "Visualizar" produtos =====
const painel = document.createElement("div");
painel.classList.add("produto-detalhe-panel");
painel.innerHTML = `
  <img src="" alt="Produto" id="panel-img">
  <h3 id="panel-nome"></h3>
  <p id="panel-preco"></p>
  <label for="tamanho">Tamanho:</label>
  <select id="tamanho"></select>
  <label for="cor" id="label-cor" style="display:none;">Cor:</label>
  <select id="cor" style="display:none;"></select>
  <div class="miniaturas" id="panel-miniaturas"></div>
  <button id="adicionar-panel">Adicionar ao carrinho</button>
  <button id="fechar-panel">Fechar</button>
`;
document.body.appendChild(painel);

// Abrir painel
function abrirPainel(produto) {
  const { nome, preco, imagens, tipos } = produto;
  const panelNome = document.getElementById("panel-nome");
  const panelPreco = document.getElementById("panel-preco");
  const panelImg = document.getElementById("panel-img");
  const panelMiniaturas = document.getElementById("panel-miniaturas");
  const selectTamanho = document.getElementById("tamanho");
  const selectCor = document.getElementById("cor");
  const labelCor = document.getElementById("label-cor");

  panelNome.innerText = nome;
  panelPreco.innerText = "Preço: R$ " + preco.toFixed(2);
  panelImg.src = imagens[0];

  // Miniaturas
  panelMiniaturas.innerHTML = "";
  imagens.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    if (i === 0) img.classList.add("active");
    img.addEventListener("click", () => {
      panelImg.src = src;
      panelMiniaturas.querySelectorAll("img").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
    });
    panelMiniaturas.appendChild(img);
  });

  // Tamanhos
  selectTamanho.innerHTML = "";
  tipos.tamanhos.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.innerText = t;
    selectTamanho.appendChild(option);
  });

  // Cores (só se houver)
  if (tipos.cores && tipos.cores.length > 0) {
    labelCor.style.display = "block";
    selectCor.style.display = "block";
    selectCor.innerHTML = "";
    tipos.cores.forEach(c => {
      const option = document.createElement("option");
      option.value = c;
      option.innerText = c;
      selectCor.appendChild(option);
    });
  } else {
    labelCor.style.display = "none";
    selectCor.style.display = "none";
  }

  painel.classList.add("active");

  // Botão adicionar
  document.getElementById("adicionar-panel").onclick = () => {
    const tamanhoSelecionado = selectTamanho.value;
    const corSelecionada = selectCor.value || null;
    adicionarAoCarrinho(nome, preco, corSelecionada, tamanhoSelecionado);
    painel.classList.remove("active");
  };
}

// Fechar painel
document.getElementById("fechar-panel").onclick = () => painel.classList.remove("active");

// Eventos dos botões "Visualizar"
document.querySelectorAll(".produto").forEach(produtoEl => {
  produtoEl.querySelector(".abrir-produto").addEventListener("click", () => {
    const nome = produtoEl.dataset.nome;
    const preco = parseFloat(produtoEl.dataset.preco);
    const imagens = JSON.parse(produtoEl.dataset.imagens);

    // Lê diretamente do HTML
    const tamanhos = produtoEl.dataset.tamanhos ? JSON.parse(produtoEl.dataset.tamanhos) : [];
    const cores = produtoEl.dataset.cores ? JSON.parse(produtoEl.dataset.cores) : [];

    abrirPainel({ nome, preco, imagens, tipos: { tamanhos, cores } });
  });
});

// ===== NOVO: Botões do Carrossel "Adicionar ao Carrinho" =====
document.querySelectorAll('.product-details .cta-button').forEach(button => {
  button.addEventListener('click', function () {
    const produtoEl = button.closest('.product-details');
    const nome = produtoEl.dataset.nome;
    const preco = parseFloat(produtoEl.dataset.preco);
    const imagens = JSON.parse(produtoEl.dataset.imagens);
    const tamanhos = produtoEl.dataset.tamanhos ? JSON.parse(produtoEl.dataset.tamanhos) : [];
    const cores = produtoEl.dataset.cores ? JSON.parse(produtoEl.dataset.cores) : [];

    abrirPainel({ nome, preco, imagens, tipos: { tamanhos, cores } });
  });
});

// ===== NOVO: Botões do Carrossel "Visualizar Detalhes" =====
document.querySelectorAll('.product-details .abrir-produto').forEach(button => {
  button.addEventListener('click', function () {
    const produtoEl = button.closest('.product-details');
    const nome = produtoEl.dataset.nome;
    const preco = parseFloat(produtoEl.dataset.preco);
    const imagens = JSON.parse(produtoEl.dataset.imagens);
    const tamanhos = produtoEl.dataset.tamanhos ? JSON.parse(produtoEl.dataset.tamanhos) : [];
    const cores = produtoEl.dataset.cores ? JSON.parse(produtoEl.dataset.cores) : [];

    abrirPainel({ nome, preco, imagens, tipos: { tamanhos, cores } });
  });
});

// ===== Verificação de Login (opcional) =====
function verificarLogin() {
  // Comentado: descomenta se quiser exigir login
  // const logado = localStorage.getItem("logado");
  // if (logado !== "true") {
  //   alert("Você precisa estar logado para continuar.");
  //   window.location.href = "login.html";
  //   return false;
  // }
  return true; // Permite comprar sem login por enquanto
}
