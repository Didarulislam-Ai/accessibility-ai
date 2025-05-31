import Stripe from 'stripe';
import { prisma } from './prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CreateCheckoutSessionParams {
  plan: string;
  email: string;
  name: string;
}

export async function createCheckoutSession({
  plan,
  email,
  name,
}: CreateCheckoutSessionParams) {
  // Create or get user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    metadata: {
      userId: user.id,
    },
  });

  return session;
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;

      if (!userId) {
        throw new Error('No user ID in session metadata');
      }

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = subscription.items.data[0].price.id;

      // Create subscription in database
      await prisma.subscription.create({
        data: {
          userId,
          apiKey: generateApiKey(),
          status: 'active',
          plan: getPlanFromStripePrice(plan),
          expiresAt: new Date(subscription.current_period_end * 1000),
        },
      });

      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (!userId) {
        throw new Error('No user ID in subscription metadata');
      }

      // Update subscription status in database
      await prisma.subscription.updateMany({
        where: {
          userId,
          status: 'active',
        },
        data: {
          status: subscription.status === 'active' ? 'active' : 'inactive',
          expiresAt: new Date(subscription.current_period_end * 1000),
        },
      });

      break;
    }
  }
}

function generateApiKey(): string {
  return `ak_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
}

function getPlanFromStripePrice(priceId: string): string {
  const planMap: Record<string, string> = {
    price_basic: 'basic',
    price_pro: 'pro',
    price_enterprise: 'enterprise',
  };

  return planMap[priceId] || 'basic';
} 