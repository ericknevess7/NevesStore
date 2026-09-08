const express = require('express');
const cors = require('cors');
require('dotenv').config();

const checkoutRoutes = require('./routes/checkout');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/checkout', checkoutRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});