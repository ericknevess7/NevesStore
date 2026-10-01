const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configura o Mercado Pago com a chave do .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

router.post('/processar-pagamento', async (req, res) => {
  try {
    const { itens, comprador } = req.body;

    const preference = new Preference(client);

    const body = {
      items: itens.map(item => ({
        title: item.nome,
        unit_price: Number(item.valorNumerico),
        quantity: 1,
        currency_id: 'BRL',
      })),
      payer: {
        name: comprador.nome,
        email: comprador.email,
      },
      back_urls: {
        success: 'http://127.0.0.1:5500/frontend/carrinho.html?status=sucesso',
        failure: 'http://127.0.0.1:5500/frontend/carrinho.html?status=falha',
        pending: 'http://127.0.0.1:5500/frontend/carrinho.html?status=pendente',
      },
      auto_return: 'approved',
    };

    const response = await preference.create({ body });

    // Retorna a URL de checkout do Mercado Pago para o Front-end
    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

module.exports = router;