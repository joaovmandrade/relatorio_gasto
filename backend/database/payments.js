import express from 'express';
import db from '../database.js';

const router = express.Router();

// Obter todos os pagamentos
router.get('/', (req, res) => {
  const sql = `SELECT * FROM payments ORDER BY date DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    // Transformar dados do BD para o formato esperado pelo frontend
    const formattedRows = rows.map(row => ({
      id: row.id.toString(), // Converter ID para string se o frontend usar strict equal
      date: row.date,
      amount: row.value,
      method: row.method
    }));
    
    res.json(formattedRows);
  });
});

// Adicionar um novo pagamento
router.post('/', (req, res) => {
  const { date, amount, method } = req.body;
  if (!date || amount === undefined || !method) {
    res.status(400).json({ error: 'Dados incompletos: data, valor e método são obrigatórios.' });
    return;
  }

  const sql = `INSERT INTO payments (date, value, method) VALUES (?, ?, ?)`;
  const params = [date, amount, method];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    const newPayment = {
      id: this.lastID.toString(),
      date,
      amount,
      method
    };
    
    res.status(201).json(newPayment);
  });
});

// Deletar um pagamento (Endpoint bônus)
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM payments WHERE id = ?`;
  
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Pagamento deletado com sucesso.', changes: this.changes });
  });
});

export default router;
