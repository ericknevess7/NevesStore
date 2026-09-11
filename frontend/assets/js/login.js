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
        if (document.getElementById('rua')) document.getElementById('rua').value = data.logradouro || '';
        if (document.getElementById('bairro')) document.getElementById('bairro').value = data.bairro || '';
        if (document.getElementById('cidade')) document.getElementById('cidade').value = data.localidade || '';
        if (document.getElementById('estado')) document.getElementById('estado').value = data.uf || '';
        if (document.getElementById('numero')) document.getElementById('numero').focus();
      } else {
        alert('⚠️ CEP não encontrado!');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  }
});

// Login Submit (Usa SEMPRE os dados oficiais retornados da API do Django)
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
      // Grava diretamente o usuário que veio da resposta da API (banco de dados)
      localStorage.setItem('token', data.token || 'django-session-token');
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('logado', 'true');

      alert('✅ Login realizado com sucesso!');
      window.location.href = 'index.html';
    } else {
      alert(`❌ ${data.error || 'Erro ao realizar login.'}`);
    }
  } catch (error) {
    alert('⚠️ Erro ao conectar com o servidor.');
  }
});

// Cadastro Submit (Guarda os dados no registro e envia para a API)
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById('nome')?.value.trim() || '',
    email: document.getElementById('register-email')?.value.trim() || '',
    senha: document.getElementById('register-senha')?.value.trim() || '',
    telefone: document.getElementById('telefone')?.value.trim() || '',
    cep: document.getElementById('cep')?.value.trim() || '',
    rua: document.getElementById('rua')?.value.trim() || '',
    numero: document.getElementById('numero')?.value.trim() || '',
    bairro: document.getElementById('bairro')?.value.trim() || '',
    cidade: document.getElementById('cidade')?.value.trim() || '',
    estado: document.getElementById('estado')?.value.trim() || ''
  };

  try {
    const response = await fetch('/api/auth/cadastro/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('usuario', JSON.stringify(dados));
      localStorage.setItem('logado', 'true');
      alert('🎉 Conta criada com sucesso!');
      window.location.href = 'index.html';
    } else {
      alert(`❌ ${data.error || 'Erro ao criar conta.'}`);
    }
  } catch (error) {
    alert('⚠️ Erro ao conectar com o servidor.');
  }
});