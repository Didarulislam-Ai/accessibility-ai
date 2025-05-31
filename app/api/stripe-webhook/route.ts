import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const email = session.customer_email as string;

    // Find or create the user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, stripeCustomerId: customerId } });
    } else if (!user.stripeCustomerId) {
      await prisma.user.update({
        where: { email },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get the subscription ID from the session
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Generate API key
    const apiKey = `ak_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

    // Store subscription in DB
    await prisma.subscription.create({
      data: {
        userId: user.id,
        apiKey,
        status: "active",
        plan: subscription.items.data[0].price.id,
        expiresAt: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  // Add more event types as needed

  return NextResponse.json({ received: true });
}

