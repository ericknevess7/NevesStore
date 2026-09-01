// Alternar abas
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

btnLogin.onclick = () => {
  btnLogin.classList.add("active");
  btnRegister.classList.remove("active");
  formLogin.classList.add("active");
  formRegister.classList.remove("active");
};

btnRegister.onclick = () => {
  btnRegister.classList.add("active");
  btnLogin.classList.remove("active");
  formRegister.classList.add("active");
  formLogin.classList.remove("active");
};

// Criar conta
formRegister.onsubmit = (e) => {
  e.preventDefault();
  const usuario = {
    nome: document.getElementById("nome").value,
    sobrenome: document.getElementById("sobrenome").value,
    email: document.getElementById("register-email").value,
    senha: document.getElementById("register-senha").value,
    cep: document.getElementById("cep").value,
    endereco: document.getElementById("endereco").value,
    cidade: document.getElementById("cidade").value,
    estado: document.getElementById("estado").value,
  };
  localStorage.setItem("usuario", JSON.stringify(usuario));
  localStorage.setItem("logado", "true");
  alert("Conta criada com sucesso!");
  window.location.href = "NevesStore.html";
};

// Login
formLogin.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario && usuario.email === email && usuario.senha === senha) {
    localStorage.setItem("logado", "true");
    alert("Login realizado com sucesso!");
    window.location.href = "NevesStore.html";
  } else {
    alert("Email ou senha incorretos!");
  }
};

// Entrar mais tarde
function entrarMaisTarde() {
  localStorage.setItem("logado", "false");
  window.location.href = "NevesStore.html";
}

// Mostrar nome no ícone de usuário
function atualizarIconeUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const logado = localStorage.getItem("logado");

  const userIcon = document.querySelector(".fa-user");
  if (logado === "true" && usuario) {
    userIcon.outerHTML = `<span class="user-nome">👤 ${usuario.nome}</span>`;
  }
}
atualizarIconeUsuario();
