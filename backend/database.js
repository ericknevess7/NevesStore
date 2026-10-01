const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'nevesstore.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabela de Usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      sobrenome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cep TEXT,
      endereco TEXT,
      cidade TEXT,
      estado TEXT
    )
  `);
});

module.exports = db;