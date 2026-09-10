// Alternar Abas
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

// Busca CEP Automática no Cadastro
document.getElementById('cep')?.addEventListener('keyup', async (e) => {
  const cep = e.target.value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
        document.getElementById('numero').focus();
      } else {
        alert('⚠️ CEP não encontrado!');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  }
});

// Login Submit (Carrega os dados salvos da conta)
formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value.trim();

  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Recupera os dados completos salvos no cadastro ou perfil
      const contasSalvas = JSON.parse(localStorage.getItem('contas_nevesstore')) || {};
      const usuarioCompleto = contasSalvas[email] || data.usuario;

      localStorage.setItem('token', data.token || 'token-ativo');
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));

      alert('✅ Login realizado com sucesso!');
      window.location.href = 'index.html';
    } else {
      alert(`❌ ${data.error || 'Erro ao realizar login.'}`);
    }
  } catch (error) {
    alert('⚠️ Erro ao conectar com o servidor.');
  }
});

// Cadastro Submit (Guarda os dados no registro)
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('register-email').value.trim(),
    senha: document.getElementById('register-senha').value.trim(),
    cep: document.getElementById('cep').value.trim(),
    rua: document.getElementById('rua').value.trim(),
    numero: document.getElementById('numero').value.trim(),
    bairro: document.getElementById('bairro').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value.trim()
  };

  try {
    const response = await fetch('/api/auth/cadastro/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const data = await response.json();

    if (response.ok) {
      // Grava no banco de dados local por e-mail
      const contasSalvas = JSON.parse(localStorage.getItem('contas_nevesstore')) || {};
      contasSalvas[dados.email] = dados;
      localStorage.setItem('contas_nevesstore', JSON.stringify(contasSalvas));

      localStorage.setItem('usuario', JSON.stringify(dados));
      alert('🎉 Conta criada com sucesso!');
      window.location.href = 'index.html';
    } else {
      alert(`❌ ${data.error || 'Erro ao criar conta.'}`);
    }
  } catch (error) {
    alert('⚠️ Erro ao conectar com o servidor.');
  }
});