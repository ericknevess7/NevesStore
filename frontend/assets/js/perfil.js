document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  // Preenche o formulário com os dados do utilizador
  document.getElementById("perfil-nome").value = usuario.nome || "";
  document.getElementById("perfil-email").value = usuario.email || "";
  document.getElementById("perfil-telefone").value = usuario.telefone || "";
  document.getElementById("perfil-cep").value = usuario.cep || "";
  document.getElementById("perfil-rua").value = usuario.rua || usuario.endereco || "";

  // Botão de Logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      window.location.href = "login.html";
    });
  }

  // Formulário de Atualização
  const formPerfil = document.getElementById("form-perfil");
  if (formPerfil) {
    formPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dadosAtualizados = {
        email: usuario.email,
        nome: document.getElementById("perfil-nome").value,
        telefone: document.getElementById("perfil-telefone").value,
        cep: document.getElementById("perfil-cep").value,
        rua: document.getElementById("perfil-rua").value,
      };

      try {
        const response = await fetch("/api/auth/perfil/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
          localStorage.setItem("usuario", JSON.stringify({ ...usuario, ...dadosAtualizados }));
          alert("Dados atualizados com sucesso!");
        } else {
          alert("Erro ao atualizar dados.");
        }
      } catch (err) {
        alert("Erro na ligação ao servidor.");
      }
    });
  }

  // Renderizar Histórico de Compras (Minhas Compras)
  const containerPedidos = document.getElementById("historico-pedidos");
  const pedidos = JSON.parse(localStorage.getItem(`pedidos_${usuario.email}`)) || [];

  if (pedidos.length > 0 && containerPedidos) {
    containerPedidos.innerHTML = "";

    pedidos.forEach((pedido, idx) => {
      let itensHtml = "";
      if (pedido.itens && pedido.itens.length > 0) {
        pedido.itens.forEach(item => {
          itensHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; padding: 10px 0;">
              <div>
                <strong style="color: #fff; font-size: 15px;">${item.title || item.nome}</strong><br>
                <small style="color: #aaa;">Cor/Modelo: ${item.cor || 'Padrão'} | Tamanho: ${item.tamanho || 'Único'} | Qtd: ${item.quantidade || 1}</small>
              </div>
              <span style="color: var(--accent-cyan); font-weight: bold;">${item.price}</span>
            </div>
          `;
        });
      }

      const card = document.createElement("div");
      card.style.cssText = "background: #181818; padding: 18px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #333;";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 12px;">
          <span style="font-weight: bold; color: var(--accent-cyan);">Pedido #${pedido.id || (idx + 1)}</span>
          <span style="color: #28a745; font-size: 13px; font-weight: bold;">✔ Enviado / Processado</span>
        </div>
        ${itensHtml}
        <div style="text-align: right; margin-top: 12px; font-size: 16px;">
          <strong>Total: <span style="color: #fff;">${pedido.total}</span></strong>
        </div>
      `;
      containerPedidos.appendChild(card);
    });
  }
});