import express from 'express';
import cors from 'cors';
import paymentsRoutes from './routes/payments.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/payments', paymentsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
