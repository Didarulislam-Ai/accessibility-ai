"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: 0,
    description: "Ideal for individuals and small sites",
    features: [
      "1 website",
      "Basic summary reports",
      "Manual issue highlights (no auto-fixes)",
      "Monthly accessibility check",
      "Chrome extension access"
    ],
    stripePriceId: "price_1RMaNYD1PReRyOO86rw4u3Mm"
  },
  {
    name: "Pro",
    price: 49,
    description: "Best for small teams and growing businesses",
    features: [
      "Up to 3 websites",
      "1,000 pages per website",
      "Full WCAG checks",
      "AI-powered auto-fixes",
      "Full dashboard + issue tracker",
      "API & Chrome Extension access",
      "Email support"
    ],
    stripePriceId: "price_1RMaU0D1PReRyOO8uYbzUONv"
  },
  {
    name: "Enterprise",
    price: 299,
    description: "Custom solutions for large organizations",
    features: [
      "Unlimited websites and pages",
      "Full ADA, AODA, and latest WCAG 2.2 compliance",
      "Daily scan reports + exportable checklists",
      "AI-powered remediation + custom rules",
      "Dedicated account manager",
      "Priority API support + SLAs",
      "Compliance documentation & audit logs"
    ],
    stripePriceId: "price_1RMaUVD1PReRyOO8VKMgqIUa"
  }
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">
          Choose the perfect plan for your accessibility needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-8 flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold mb-2">
                ${plan.price}
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              onClick={() => {
                // Handle subscription
                window.location.href = `/checkout?plan=${plan.stripePriceId}`;
              }}
            >
              Get Started
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
} 