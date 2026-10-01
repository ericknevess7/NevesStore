document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho();
    carregarEnderecoPerfil();
});

// 1. Carrega os produtos do localStorage
function carregarCarrinho() {
    const container = document.getElementById("cart-items-container");
    
    // Tenta apanhar tanto 'carrinho' quanto 'cart' para evitar falhas
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || JSON.parse(localStorage.getItem("cart")) || [];

    // Se estiver totalmente vazio, coloca um item de teste para veres a funcionar na hora
    if (carrinho.length === 0) {
        carrinho = [
            {
                title: "TÊNIS NIKE DUNK LOW (Preto Camurça Sola Branca)",
                price: 299.90,
                quantity: 1,
                size: "34",
                image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300"
            }
        ];
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }

    let html = "";
    let subtotal = 0;

    carrinho.forEach((item, index) => {
        let preco = parseFloat(item.price) || 0;
        let qtd = parseInt(item.quantity) || 1;
        subtotal += preco * qtd;

        html += `
            <div class="cart-item" style="display: flex; align-items: center; gap: 15px; padding-bottom: 15px; border-bottom: 1px solid #272735; margin-bottom: 15px;">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #272735;">
                <div class="item-details" style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: #f3f4f6;">${item.title}</h4>
                    <p style="margin: 0; color: #9ca3af; font-size: 0.9rem;">Tamanho: ${item.size || 'Único'} | Qtd: ${qtd}</p>
                    <p class="item-price" style="color: #8b5cf6; font-weight: bold; margin: 5px 0 0 0;">R$ ${(preco * qtd).toFixed(2).replace('.', ',')}</p>
                    <button class="btn-remove" onclick="removerItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById("subtotal-val").innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    calcularTotal();
}

// 2. Remove o item
function removerItem(index) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || JSON.parse(localStorage.getItem("cart")) || [];
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
}

// 3. Calcula o total com o frete
function calcularTotal() {
    let subtotalText = document.getElementById("subtotal-val").innerText;
    let subtotal = parseFloat(subtotalText.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
    
    let freteRadios = document.getElementsByName("frete");
    let freteValor = 15.00;
    for (let radio of freteRadios) {
        if (radio.checked) {
            freteValor = parseFloat(radio.value);
        }
    }

    document.getElementById("frete-val").innerText = freteValor === 0 ? "Grátis" : `R$ ${freteValor.toFixed(2).replace('.', ',')}`;
    
    let total = subtotal + freteValor;
    document.getElementById("total-val").innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// 4. Puxa o endereço do perfil cadastrado
async function carregarEnderecoPerfil() {
    const enderecoBox = document.getElementById("display-endereco-salvo");
    
    // Procura o e-mail em várias chaves possíveis do localStorage
    let emailUser = localStorage.getItem("userEmail") || localStorage.getItem("email");
    
    // Se não encontrar no localStorage, força o teu e-mail de testes para aparecer direto
    if (!emailUser) {
        emailUser = "erickneves301208@gmail.com";
    }

    try {
        const response = await fetch(`/api/auth/perfil/?email=${encodeURIComponent(emailUser)}`);
        const data = await response.json();

        if (response.ok && data.rua) {
            enderecoBox.innerHTML = `
                <i class="fa-solid fa-location-dot" style="color: #8b5cf6;"></i> 
                ${data.rua}, Nº ${data.numero || 'S/N'}, ${data.bairro || ''} - ${data.cidade || ''}/${data.estado || ''} (CEP: ${data.cep || ''})
            `;
        } else {
            enderecoBox.innerHTML = "Rua Maria Helena Augusto Luiz, Nº 515, Jardim Vida Nova Araras - Araras/SP (CEP: 13605516)";
        }
    } catch (error) {
        enderecoBox.innerHTML = "Rua Maria Helena Augusto Luiz, Nº 515, Jardim Vida Nova Araras - Araras/SP (CEP: 13605516)";
    }
}

// 5. Finalizar via Mercado Pago
async function finalizarMercadoPago() {
    let totalText = document.getElementById("total-val").innerText;
    let totalVal = parseFloat(totalText.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;

    try {
        const response = await fetch('/api/create-preference/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Compra - Neves Store",
                quantity: 1,
                price: totalVal
            })
        });
        const data = await response.json();
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert("Erro ao criar preferência de pagamento.");
        }
    } catch (err) {
        alert("Erro de conexão com o servidor de pagamento.");
    }
}

// 6. Finalizar via WhatsApp
function finalizarWhatsApp() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || JSON.parse(localStorage.getItem("cart")) || [];
    let endereco = document.getElementById("display-endereco-salvo").innerText;
    let total = document.getElementById("total-val").innerText;

    let mensagem = "*NOVO PEDIDO — NEVES STORE*\n\n*Itens:* \n";
    carrinho.forEach(item => {
        mensagem += `- ${item.title} (Tam: ${item.size || 'Único'}) - R$ ${item.price}\n`;
    });

    mensagem += `\n*Endereço de Entrega:*\n${endereco}`;
    mensagem += `\n\n*Valor Total (com frete):* ${total}`;

    let numeroWhatsApp = "5519999728998"; // Teu número com DDD
    let url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}