"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CheckoutFormProps {
  email: string;
  plan: string;
}

export default function CheckoutForm({ email, plan }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email,
          name: formData.get("name") || "",
        }),
      });
      const session = await res.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to create checkout session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          disabled
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : "Continue to Payment"}
      </Button>
    </form>
  );
} 