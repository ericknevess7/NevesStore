document.addEventListener("DOMContentLoaded", async () => {
    // 0. Processa o retorno do Mercado Pago quando o cliente volta para a loja
    await processarRetornoMercadoPago();

    carregarCarrinho();
    carregarEnderecoPerfil();
});

// 0. Captura o retorno do Mercado Pago (Pix / Cartão / Boleto)
async function processarRetornoMercadoPago() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Captura qualquer um dos parâmetros que o Mercado Pago costuma enviar
    const status = urlParams.get('status') || urlParams.get('collection_status');
    const paymentId = urlParams.get('payment_id') || urlParams.get('collection_id');

    // Se o pagamento foi aprovado/sucesso ou veio um ID de pagamento
    if (status === 'success' || status === 'approved' || paymentId) {
        const usuario = JSON.parse(localStorage.getItem("usuario")) || {
            email: localStorage.getItem("userEmail") || localStorage.getItem("email") || "01erickneves01@gmail.com",
            nome: "Cliente Neves Store"
        };
        
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || JSON.parse(localStorage.getItem("cart")) || [];

        if (carrinho.length > 0) {
            let subtotal = carrinho.reduce((acc, item) => {
                let preco = parseFloat(item.price) || 0;
                let qtd = parseInt(item.quantity) || 1;
                return acc + (preco * qtd);
            }, 0);

            let totalVal = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

            const novoPedido = {
                id: paymentId || Math.floor(100000 + Math.random() * 900000),
                data: new Date().toLocaleDateString('pt-BR'),
                itens: carrinho,
                total: totalVal,
                status: "Aprovado"
            };

            // Guarda o pedido nas duas chaves possíveis do localStorage para garantir exibição em perfil.html
            const historicoChave = `pedidos_${usuario.email}`;
            const pedidosAnteriores = JSON.parse(localStorage.getItem(historicoChave)) || JSON.parse(localStorage.getItem("pedidos")) || [];
            pedidosAnteriores.unshift(novoPedido);
            
            localStorage.setItem(historicoChave, JSON.stringify(pedidosAnteriores));
            localStorage.setItem("pedidos", JSON.stringify(pedidosAnteriores));

            // Dispara e-mail de confirmação ao cliente e aviso de venda ao administrador
            try {
                await fetch('/api/enviar-confirmacao/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: usuario.email,
                        nome: usuario.nome || "Cliente",
                        telefone: usuario.telefone || 'Não informado',
                        endereco: usuario.rua ? `${usuario.rua}, Nº ${usuario.numero || ''}` : 'Endereço cadastrado no perfil',
                        itens: carrinho,
                        total: totalVal
                    })
                });
            } catch (err) {
                console.error("Erro ao enviar e-mail de confirmação:", err);
            }

            // Apaga o carrinho definitivamente
            localStorage.removeItem("carrinho");
            localStorage.removeItem("cart");

            // Limpa os parâmetros da URL para evitar loops
            window.history.replaceState({}, document.title, window.location.pathname);

            alert("🎉 Pagamento aprovado com sucesso! O teu pedido foi registrado em 'Minhas Compras'.");
            window.location.href = "perfil.html";
        }
    }
}

// 1. Carrega os produtos do localStorage
function carregarCarrinho() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || JSON.parse(localStorage.getItem("cart")) || [];

    if (carrinho.length === 0) {
        container.innerHTML = "<p style='color: #888; text-align: center; padding: 20px;'>O teu carrinho está vazio.</p>";
        if (document.getElementById("subtotal-val")) document.getElementById("subtotal-val").innerText = "R$ 0,00";
        if (document.getElementById("frete-val")) document.getElementById("frete-val").innerText = "R$ 0,00";
        if (document.getElementById("total-val")) document.getElementById("total-val").innerText = "R$ 0,00";
        return;
    }

    let html = "";
    let subtotal = 0;

    carrinho.forEach((item, index) => {
        let preco = parseFloat(item.price) || 0;
        let qtd = parseInt(item.quantity) || 1;
        subtotal += preco * qtd;

        html += `
            <div class="cart-item" style="display: flex; align-items: center; gap: 15px; padding-bottom: 15px; border-bottom: 1px solid #272735; margin-bottom: 15px;">
                <img src="${item.image || item.img || 'https://via.placeholder.com/80'}" alt="${item.title || item.nome}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #272735;">
                <div class="item-details" style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: #f3f4f6;">${item.title || item.nome}</h4>
                    <p style="margin: 0; color: #9ca3af; font-size: 0.9rem;">Cor: ${item.cor || 'Padrão'} | Tamanho: ${item.size || item.tamanho || 'Único'} | Qtd: ${qtd}</p>
                    <p class="item-price" style="color: #8b5cf6; font-weight: bold; margin: 5px 0 0 0;">R$ ${(preco * qtd).toFixed(2).replace('.', ',')}</p>
                    <button class="btn-remove" onclick="removerItem(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (document.getElementById("subtotal-val")) {
        document.getElementById("subtotal-val").innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
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
    let subtotalElem = document.getElementById("subtotal-val");
    if (!subtotalElem) return;

    let subtotalText = subtotalElem.innerText;
    let subtotal = parseFloat(subtotalText.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;
    
    let freteRadios = document.getElementsByName("frete");
    let freteValor = 0.00;
    for (let radio of freteRadios) {
        if (radio.checked) {
            freteValor = parseFloat(radio.value);
        }
    }

    if (document.getElementById("frete-val")) {
        document.getElementById("frete-val").innerText = freteValor === 0 ? "Grátis" : `R$ ${freteValor.toFixed(2).replace('.', ',')}`;
    }
    
    let total = subtotal + freteValor;
    if (document.getElementById("total-val")) {
        document.getElementById("total-val").innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// 4. Puxa o endereço do perfil cadastrado
async function carregarEnderecoPerfil() {
    const enderecoBox = document.getElementById("display-endereco-salvo");
    if (!enderecoBox) return;
    
    let usuario = JSON.parse(localStorage.getItem("usuario"));
    let emailUser = usuario ? usuario.email : (localStorage.getItem("userEmail") || localStorage.getItem("email") || "01erickneves01@gmail.com");

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
    let totalElem = document.getElementById("total-val");
    let totalText = totalElem ? totalElem.innerText : "R$ 0,00";
    let totalVal = parseFloat(totalText.replace("R$", "").replace(".", "").replace(",", ".").trim()) || 0;

    if (totalVal <= 0) {
        alert("O teu carrinho está vazio!");
        return;
    }

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
    let enderecoElem = document.getElementById("display-endereco-salvo");
    let totalElem = document.getElementById("total-val");
    
    let endereco = enderecoElem ? enderecoElem.innerText : "Não informado";
    let total = totalElem ? totalElem.innerText : "R$ 0,00";

    if (carrinho.length === 0) {
        alert("O teu carrinho está vazio!");
        return;
    }

    let mensagem = "*NOVO PEDIDO — NEVES STORE*\n\n*Itens:* \n";
    carrinho.forEach(item => {
        mensagem += `- ${item.title || item.nome} (Cor: ${item.cor || 'Padrão'}, Tam: ${item.size || item.tamanho || 'Único'}) - R$ ${item.price}\n`;
    });

    mensagem += `\n*Endereço de Entrega:*\n${endereco}`;
    mensagem += `\n\n*Valor Total (com frete):* ${total}`;

    let numeroWhatsApp = "5519999728998";
    let url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}
