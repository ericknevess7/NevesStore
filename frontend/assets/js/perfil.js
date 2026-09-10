const API_URL = '/api';

window.addEventListener('DOMContentLoaded', async () => {
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

  if (!usuarioLocal || !usuarioLocal.email) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "login.html";
    return;
  }

  // Preenche rápido com os dados salvos em memória
  preencherFormulario(usuarioLocal);

  // Busca os dados oficiais atualizados direto do banco SQLite no Django
  try {
    const res = await fetch(`${API_URL}/auth/perfil/?email=${encodeURIComponent(usuarioLocal.email)}`);
    if (res.ok) {
      const dadosBanco = await res.json();
      preencherFormulario(dadosBanco);
      localStorage.setItem("usuario", JSON.stringify({ ...usuarioLocal, ...dadosBanco }));
    }
  } catch (err) {
    console.warn("Erro ao buscar perfil atualizado do banco:", err);
  }
});

function preencherFormulario(dados) {
  if (!dados) return;

  const displayNome = document.getElementById("display-nome");
  const displayEmail = document.getElementById("display-email");
  if (displayNome) displayNome.innerText = dados.nome || "Usuário";
  if (displayEmail) displayEmail.innerText = dados.email || "";

  if (document.getElementById("nome")) document.getElementById("nome").value = dados.nome || "";
  if (document.getElementById("email")) document.getElementById("email").value = dados.email || "";
  if (document.getElementById("telefone")) document.getElementById("telefone").value = dados.telefone || "";
  if (document.getElementById("cep")) document.getElementById("cep").value = dados.cep || "";
  if (document.getElementById("rua")) document.getElementById("rua").value = dados.rua || "";
  if (document.getElementById("numero")) document.getElementById("numero").value = dados.numero || "";
  if (document.getElementById("bairro")) document.getElementById("bairro").value = dados.bairro || "";
  if (document.getElementById("cidade")) document.getElementById("cidade").value = dados.cidade || "";
  if (document.getElementById("estado")) document.getElementById("estado").value = dados.estado || "";
}

// Autocompletar CEP ViaCEP
document.getElementById("cep")?.addEventListener("keyup", async (e) => {
  const cep = e.target.value.replace(/\D/g, "");
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById("rua").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";
        document.getElementById("cidade").value = data.localidade || "";
        document.getElementById("estado").value = data.uf || "";
        document.getElementById("numero").focus();
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  }
});

// Envio para o servidor Django
const formPerfil = document.getElementById("perfil-form");
if (formPerfil) {
  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuarioLocal = JSON.parse(localStorage.getItem("usuario")) || {};

    const usuarioAtualizado = {
      email: usuarioLocal.email || document.getElementById("email")?.value,
      nome: document.getElementById("nome")?.value.trim() || "",
      telefone: document.getElementById("telefone")?.value.trim() || "",
      cep: document.getElementById("cep")?.value.trim() || "",
      rua: document.getElementById("rua")?.value.trim() || "",
      numero: document.getElementById("numero")?.value.trim() || "",
      bairro: document.getElementById("bairro")?.value.trim() || "",
      cidade: document.getElementById("cidade")?.value.trim() || "",
      estado: document.getElementById("estado")?.value.trim() || ""
    };

    try {
      const res = await fetch(`${API_URL}/auth/perfil/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioAtualizado)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
        const displayNome = document.getElementById("display-nome");
        if (displayNome) displayNome.innerText = usuarioAtualizado.nome;
        alert("✅ Perfil e endereço salvos com sucesso no Banco de Dados!");
      } else {
        alert("Erro ao salvar no servidor: " + (data.error || "Falha na requisição"));
      }
    } catch (err) {
      console.error("Erro ao enviar perfil:", err);
      alert("Erro de conexão com o servidor.");
    }
  });
}

function logout() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.setItem("logado", "false");
  alert("Você saiu da sua conta.");
  window.location.href = "login.html";
}