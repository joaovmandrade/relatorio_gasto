import express from 'express';
import cors from 'cors';
import paymentsRoutes from './routes/payments.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Permitir requisições do frontend React
app.use(express.json()); // Permitir JSON no body

// Rotas
app.use('/payments', paymentsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
