import { loadStripe } from '@stripe/stripe-js';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.init();
  }

  async init() {
    // Replace with your Stripe publishable key
    this.stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }

  async createSubscription(priceId) {
    try {
      // Create a checkout session on the server
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await this.stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  async getCurrentSubscription() {
    try {
      const response = await fetch('/api/current-subscription');
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  async cancelSubscription() {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export default new PaymentService();
