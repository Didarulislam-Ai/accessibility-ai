import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { plan, email, name } = await req.json();
    const session = await createCheckoutSession({ plan, email, name });
    return NextResponse.json(session);
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
