"use client";
// import { useSession } from "next-auth/react";

export default function AccountPage() {
  // const { data: session } = useSession();
  // You can fetch the user's subscription info here if needed
  // For now, you can paste your existing code for API key, integration guide, and manage subscription UI here
  return (
    <div>
      {/* Paste your account/subscription UI here */}
      {/* Example: */}
      <h2 className="text-xl font-semibold mb-4">API Key</h2>
      <div className="bg-gray-100 p-2 rounded mb-6">ak_cnh8hikd6mmalahw6y</div>
      <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-6">
{`<script src="https://cdn.accessibility-dashboard.com/client.js"></script>
<script>
  const dashboard = new AccessibilityDashboard('ak_cnh8hikd6mmalahw6y');
  dashboard.initialize();
</script>`}
      </pre>
      <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
      <button className="bg-black text-white px-4 py-2 rounded">Manage Subscription</button>
    </div>
  );
} 