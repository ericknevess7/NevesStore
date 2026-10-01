const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = 'secreta_nevesstore_123';

// Rota de Cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, sobrenome, email, senha, cep, endereco, cidade, estado } = req.body;

  if (!email || !senha || !nome) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const sql = `INSERT INTO usuarios (nome, sobrenome, email, senha, cep, endereco, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [nome, sobrenome, email, senhaHash, cep, endereco, cidade, estado], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
      }
      res.status(201).json({ message: 'Conta criada com sucesso!', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Rota de Login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const sql = `SELECT * FROM usuarios WHERE email = ?`;
  db.get(sql, [email], async (err, usuario) => {
    if (err || !usuario) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1d' });

    delete usuario.senha;
    res.json({ message: 'Login realizado com sucesso!', token, usuario });
  });
});

module.exports = router;