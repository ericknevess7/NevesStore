document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btn-login");
    const btnRegister = document.getElementById("btn-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");

    // Alternar entre as abas de Entrar e Criar Conta
    if (btnLogin && btnRegister) {
        btnLogin.addEventListener("click", () => {
            btnLogin.classList.add("active");
            btnRegister.classList.remove("active");
            formLogin.classList.add("active");
            formRegister.classList.remove("active");
        });

        btnRegister.addEventListener("click", () => {
            btnRegister.classList.add("active");
            btnLogin.classList.remove("active");
            formRegister.classList.add("active");
            formLogin.classList.remove("active");
        });
    }

    // Busca automática de CEP no cadastro
    const cepInput = document.getElementById("cep");
    if (cepInput) {
        cepInput.addEventListener("blur", async (e) => {
            const cep = e.target.value.replace(/\D/g, "");
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        document.getElementById("rua").value = data.logradouro || "";
                        document.getElementById("bairro").value = data.bairro || "";
                        document.getElementById("cidade").value = data.localidade || "";
                        document.getElementById("estado").value = data.uf || "";
                    } else {
                        alert("CEP não encontrado.");
                    }
                } catch (err) {
                    console.error("Erro ao buscar CEP:", err);
                }
            }
        });
    }

    // Ação de Login
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const senha = document.getElementById("login-senha").value;

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("usuario", JSON.stringify(data.usuario));
                    window.location.href = "index.html";
                } else {
                    // Mostra a mensagem de erro
                    const erroMsg = document.getElementById("erro-login-msg");
                    if (erroMsg) {
                        erroMsg.innerText = data.error || "E-mail ou palavra-passe incorretos.";
                        erroMsg.style.display = "block";
                    }
                    // ATIVA O BOTÃO "ESQUECI A PALAVRA-PASSE" AUTOMATICAMENTE AO ERRAR
                    const btnEsqueci = document.getElementById("btn-esqueci-senha");
                    if (btnEsqueci) btnEsqueci.style.display = "block";
                }
            } catch (err) {
                alert("Erro de conexão com o servidor.");
            }
        });
    }

    // Ação de Cadastro
    if (formRegister) {
        formRegister.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const senha = document.getElementById("register-senha").value;
            const cep = document.getElementById("cep").value.trim();
            const rua = document.getElementById("rua").value.trim();
            const numero = document.getElementById("numero").value.trim();
            const bairro = document.getElementById("bairro").value.trim();
            const cidade = document.getElementById("cidade").value.trim();
            const estado = document.getElementById("estado").value.trim();

            try {
                const response = await fetch('/api/cadastro/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, cep, rua, numero, bairro, cidade, estado })
                });
                const data = await response.json();

                if (response.ok) {
                    alert("Conta criada com sucesso! Faça login para continuar.");
                    btnLogin.click(); // Vai para a aba de login
                } else {
                    alert(data.error || "Erro ao criar conta.");
                }
            } catch (err) {
                alert("Erro de conexão com o servidor.");
            }
        });
    }
});

// Função para disparar o pedido de recuperação de palavra-passe
async function pedirRecuperacaoSenha() {
    const emailInput = document.getElementById("login-email").value.trim();
    if (!emailInput) {
        alert("Por favor, preencha o campo de e-mail acima primeiro.");
        return;
    }

    try {
        const res = await fetch('/api/esqueci-senha/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });
        const data = await res.json();
        alert(data.message || "Se o e-mail estiver registado, as instruções foram enviadas.");
    } catch (err) {
        alert("Erro ao tentar recuperar a palavra-passe.");
    }
}