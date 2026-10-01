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

let imagemSelecionada = "";

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
  panelPreco.innerText = "Preço: R$ " + preco.toFixed(2).replace('.', ',');
  panelImg.src = imagens[0];
  imagemSelecionada = imagens[0];

  // Miniaturas
  panelMiniaturas.innerHTML = "";
  imagens.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    if (i === 0) img.classList.add("active");
    img.addEventListener("click", () => {
      panelImg.src = src;
      imagemSelecionada = src;
      panelMiniaturas.querySelectorAll("img").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
    });
    panelMiniaturas.appendChild(img);
  });

  // Tamanhos
  selectTamanho.innerHTML = "";
  if (tipos.tamanhos && tipos.tamanhos.length > 0) {
    tipos.tamanhos.forEach(t => {
      const option = document.createElement("option");
      option.value = t;
      option.innerText = t;
      selectTamanho.appendChild(option);
    });
  }

  // Cores
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
    const corSelecionada = selectCor.style.display !== "none" ? selectCor.value : null;
    adicionarAoCarrinho(nome, preco, imagemSelecionada, corSelecionada, tamanhoSelecionado);
    painel.classList.remove("active");
  };
}

// Fechar painel
document.getElementById("fechar-panel").onclick = () => painel.classList.remove("active");

// Eventos dos botões "Visualizar"
document.querySelectorAll(".produto").forEach(produtoEl => {
  const btn = produtoEl.querySelector(".abrir-produto");
  if (btn) {
    btn.addEventListener("click", () => {
      const nome = produtoEl.dataset.nome;
      const preco = parseFloat(produtoEl.dataset.preco);
      
      // Converte a string de imagens ou pega o src direto da img
      let imagens = [];
      try {
        imagens = JSON.parse(produtoEl.dataset.imagens);
      } catch(e) {
        const imgTag = produtoEl.querySelector("img");
        if (imgTag) imagens = [imgTag.src];
      }

      const tamanhos = produtoEl.dataset.tamanhos ? JSON.parse(produtoEl.dataset.tamanhos) : [];
      const cores = produtoEl.dataset.cores ? JSON.parse(produtoEl.dataset.cores) : [];

      abrirPainel({ nome, preco, imagens, tipos: { tamanhos, cores } });
    });
  }
});

// ===== Carrinho com LocalStorage =====
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarContadorCarrinho() {
  const contador = document.getElementById('cart-count');
  if (contador) contador.textContent = carrinho.length;
}
atualizarContadorCarrinho();

function adicionarAoCarrinho(nome, preco, imagem, cor = null, tamanho = null) {
  const precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
  const produto = { 
    nome, 
    preco: precoFormatado, 
    valorNumerico: preco, 
    imagem: imagem || '', 
    cor, 
    tamanho 
  };
  
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

// ===== Menu Toggle Mobile =====
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.toggle('show');
});