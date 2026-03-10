import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar ao banco de dados SQLite (cria o arquivo se não existir)
const dbPath = path.resolve(__dirname, 'database/payments.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite em:', dbPath);
    
    // Criar tabela pagamentos se não existir
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        value REAL,
        method TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela:', err.message);
      } else {
        console.log('Tabela de pagamentos pronta.');
      }
    });
  }
});

export default db;
