const Stripe = require('stripe');

exports.handler = async (event) => {
  try {
    const id = (event.queryStringParameters || {}).session_id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ paid: false }) };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const s = await stripe.checkout.sessions.retrieve(id);
    const paid = s.payment_status === 'paid';
    return {
      statusCode: 200,
      body: JSON.stringify({ paid, plan: paid ? s.metadata.plan : null, email: paid ? s.customer_details?.email : null })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ paid: false }) };
  }
};
