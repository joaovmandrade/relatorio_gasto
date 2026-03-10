import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET /payments - Return all payments ordered by date
router.get('/', (req, res) => {
  const sql = `SELECT * FROM payments ORDER BY date DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    // The frontend expects the map: id, date, amount (for value), method
    const formattedRows = rows.map(row => ({
      id: row.id.toString(),
      date: row.date,
      amount: row.value,
      method: row.method
    }));
    
    res.json(formattedRows);
  });
});

// POST /payments - Insert a new payment into the SQLite database
router.post('/', (req, res) => {
  const { date, amount, method } = req.body;
  if (!date || amount === undefined || !method) {
    res.status(400).json({ error: 'Dados incompletos' });
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

// DELETE /payments/:id - Delete a payment
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM payments WHERE id = ?`;
  
  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Pagamento deletado.', changes: this.changes });
  });
});

export default router;
