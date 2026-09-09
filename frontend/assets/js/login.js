// ===== CONTROLE DAS ABAS DE LOGIN E CADASTRO =====
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

btnLogin?.addEventListener('click', () => {
  btnLogin.classList.add('active');
  btnRegister.classList.remove('active');
  formLogin.classList.add('active');
  formRegister.classList.remove('active');
});

btnRegister?.addEventListener('click', () => {
  btnRegister.classList.add('active');
  btnLogin.classList.remove('active');
  formRegister.classList.add('active');
  formLogin.classList.remove('active');
});

// ===== ENVIO DO FORMULÁRIO DE LOGIN =====
formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value.trim();

  if (!email || !senha) {
    alert('⚠️ Preencha todos os campos!');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      alert('✅ Login realizado com sucesso!');
      window.location.href = 'index.html'; 
    } else {
      alert(`❌ ${data.error || 'Erro ao realizar login.'}`);
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }
});

// ===== ENVIO DO FORMULÁRIO DE CADASTRO =====
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById('nome').value.trim(),
    sobrenome: document.getElementById('sobrenome').value.trim(),
    email: document.getElementById('register-email').value.trim(),
    senha: document.getElementById('register-senha').value.trim(),
    cep: document.getElementById('cep').value.trim(),
    endereco: document.getElementById('endereco').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value.trim()
  };

  if (!dados.nome || !dados.email || !dados.senha) {
    alert('⚠️ Preencha os campos obrigatórios!');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/cadastro/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const data = await response.json();

    if (response.ok) {
      alert('🎉 Conta criada com sucesso! Faça login para continuar.');
      formRegister.reset();
      btnLogin.click();
    } else {
      alert(`❌ ${data.error || 'Erro ao criar conta.'}`);
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }
});

// ===== BOTÃO ENTRAR MAIS TARDE =====
function entrarMaisTarde() {
  window.location.href = 'index.html';
}