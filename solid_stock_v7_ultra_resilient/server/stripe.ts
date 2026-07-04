import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export interface CreateSubscriptionInput {
  userId: number;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  paymentMethodId: string;
}

export interface UpdateSubscriptionInput {
  subscriptionId: string;
  plan: 'starter' | 'professional' | 'enterprise';
}

const PLAN_PRICES = {
  starter: 2900, // $29.00 in cents
  professional: 9900, // $99.00 in cents
  enterprise: 0, // Custom pricing
};

const PLAN_LIMITS = {
  starter: {
    users: 5,
    products: 1000,
    features: ['basic_dashboard', 'inventory', 'basic_support'],
  },
  professional: {
    users: 50,
    products: -1, // unlimited
    features: ['advanced_dashboard', 'inventory', 'customers', 'reports', 'api', 'priority_support'],
  },
  enterprise: {
    users: -1, // unlimited
    products: -1,
    features: ['all'],
  },
};

/**
 * Create a new Stripe customer and subscription
 */
export async function createSubscription(input: CreateSubscriptionInput) {
  try {
    // Create customer
    const customer = await stripe.customers.create({
      email: input.email,
      metadata: {
        userId: input.userId.toString(),
      },
    });

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.attach(input.paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Solid Stock - ${input.plan.toUpperCase()}`,
              metadata: {
                plan: input.plan,
              },
            },
            unit_amount: PLAN_PRICES[input.plan],
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
        },
      ],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      customerId: customer.id,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscription(input: UpdateSubscriptionInput) {
  try {
    const subscription = await stripe.subscriptions.retrieve(input.subscriptionId);
    
    if (!subscription.items.data[0]) {
      throw new Error('No subscription items found');
    }

    const updatedSubscription = await stripe.subscriptions.update(input.subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Solid Stock - ${input.plan.toUpperCase()}`,
            },
            unit_amount: PLAN_PRICES[input.plan],
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return {
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelledAt: new Date(subscription.canceled_at! * 1000),
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      plan: subscription.metadata?.plan || 'unknown',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

/**
 * Create payment intent for one-time payment
 */
export async function createPaymentIntent(amount: number, customerId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      customer: customerId,
      payment_method_types: ['card'],
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: 'starter' | 'professional' | 'enterprise') {
  return PLAN_LIMITS[plan];
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: 'starter' | 'professional' | 'enterprise') {
  const price = PLAN_PRICES[plan];
  return price / 100; // Convert cents to dollars
}

export default stripe;
