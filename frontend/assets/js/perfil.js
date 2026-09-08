// Preencher dados já salvos
window.onload = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const logado = localStorage.getItem("logado");
  
    if (logado !== "true" || !usuario) {
      alert("Você precisa estar logado para acessar o perfil.");
      window.location.href = "login.html";
      return;
    }
  
    // Preenche os campos
    document.getElementById("nome").value = usuario.nome || "";
    document.getElementById("sobrenome").value = usuario.sobrenome || "";
    document.getElementById("email").value = usuario.email || "";
    document.getElementById("senha").value = usuario.senha || "";
    document.getElementById("cep").value = usuario.cep || "";
    document.getElementById("endereco").value = usuario.endereco || "";
    document.getElementById("cidade").value = usuario.cidade || "";
    document.getElementById("estado").value = usuario.estado || "";
  };
  
  // Salvar alterações
  document.getElementById("perfil-form").onsubmit = (e) => {
    e.preventDefault();
  
    const usuarioAtualizado = {
      nome: document.getElementById("nome").value,
      sobrenome: document.getElementById("sobrenome").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      cep: document.getElementById("cep").value,
      endereco: document.getElementById("endereco").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
    };
  
    localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
    alert("Perfil atualizado com sucesso!");
    window.location.href = "NevesStore.html";
  };
  
  // Logout
  function logout() {
    localStorage.setItem("logado", "false");
    alert("Você saiu da sua conta.");
    window.location.href = "login.html";
  }
  