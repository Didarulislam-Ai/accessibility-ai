import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Define your Stripe Product IDs
    const basicProductId = process.env.STRIPE_BASIC_PRODUCT_ID;
    const proProductId = process.env.STRIPE_PRO_PRODUCT_ID;
    const enterpriseProductId = process.env.STRIPE_ENTERPRISE_PRODUCT_ID;

    if (!basicProductId || !proProductId || !enterpriseProductId) {
      return NextResponse.json(
        { error: 'Stripe Product IDs not configured' },
        { status: 500 }
      );
    }

    // Fetch all active products that are relevant
    const products = await stripe.products.list({
      active: true,
    });

    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
    });

    const pricingData = products.data
      .filter(product => 
        product.id === basicProductId || 
        product.id === proProductId || 
        product.id === enterpriseProductId
      )
      .map((product) => {
        const productPrices = prices.data.filter(
          (price) => price.product === product.id
        );
        // Assuming one recurring price per product for simplicity
        const monthlyPrice = productPrices.find(price => price.recurring?.interval === 'month');

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: monthlyPrice && monthlyPrice.unit_amount !== null ? (monthlyPrice.unit_amount / 100).toFixed(0) : 'Contact Sales',
          priceId: monthlyPrice?.id || null,
          features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
        };
      });

    return NextResponse.json({ pricingData });
  } catch (error) {
    console.error('Error fetching Stripe pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
} 