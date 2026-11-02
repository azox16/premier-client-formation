const Stripe = require('stripe');

// Les prix sont définis ici, côté serveur : le navigateur ne peut pas les modifier.
const PLANS = {
  modeles:   { name: 'Modèles',   amount: 5000 },
  essentiel: { name: 'Essentiel', amount: 10000 },
  complet:   { name: 'Complet',   amount: 15500 },
  premium:   { name: 'Premium',   amount: 40000 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Méthode non autorisée' };
  try {
    const { plan } = JSON.parse(event.body || '{}');
    const p = PLANS[plan];
    if (!p) return { statusCode: 400, body: JSON.stringify({ error: 'Formule inconnue' }) };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const site = process.env.URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: p.amount,
          product_data: { name: 'Premier Client – ' + p.name }
        }
      }],
      metadata: { plan },
      success_url: site + '/?paiement=ok&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: site + '/#inscription'
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur de paiement' }) };
  }
};
