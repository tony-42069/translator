const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current subscription
router.get('/current-subscription', async (req, res) => {
  try {
    // Note: In a real application, you would get the customer ID from the authenticated user's session
    const customerId = req.user?.stripeCustomerId;
    
    if (!customerId) {
      return res.json({ subscription: null });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    res.json({
      subscription: subscriptions.data[0] || null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const customerId = req.user?.stripeCustomerId;
    
    if (!customerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update user's subscription status in your database
      console.log('Subscription status updated:', subscription.status);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
