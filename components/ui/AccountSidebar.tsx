"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AccountData = {
  apiKey?: string | null;
  plan?: string | null;
  status?: string | null;
  expiresAt?: string | null;
  error?: string;
};

export default function AccountSidebar() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchAccount() {
      const res = await fetch("/api/account");
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetchAccount();
  }, []);

  if (loading) return <div className="w-full flex justify-center items-center py-12">Loading account info...</div>;
  if (data?.error) return <div className="w-full flex justify-center items-center py-12 text-red-600">{data.error}</div>;

  return (
    <div className="w-full mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col gap-20">
        <div>
          <h2 className="text-2xl font-bold mb-7 text-gray-900">Subscription Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-9 text-gray-700">
            <div><span className="font-semibold">Plan:</span> {data?.plan || "N/A"}</div>
            <div><span className="font-semibold">Status:</span> {data?.status || "N/A"}</div>
            <div><span className="font-semibold">Expires:</span> {data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "N/A"}</div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">API Key</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-100 p-3 rounded-md">
            <span className="break-all text-gray-800 text-sm flex-1">{data?.apiKey || "No API key found"}</span>
            {data?.apiKey && (
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition"
                onClick={() => navigator.clipboard.writeText(data.apiKey!)}
              >
                Copy
              </button>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Integration Guide</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm text-gray-800 mb-0 whitespace-pre-wrap">
{`<script src="https://cdn.accessibility-dashboard.com/client.js"></script>
<script>
  const dashboard = new AccessibilityDashboard('${data?.apiKey || "YOUR_API_KEY"}');
  dashboard.initialize();
</script>`}
          </pre>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Manage Subscription</h2>
          <button
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-semibold transition"
            onClick={async () => {
              const res = await fetch("/api/stripe-portal", { method: "POST" });
              const json = await res.json();
              if (json.url) {
                window.location.href = json.url;
              } else {
                alert("Failed to open Stripe portal.");
              }
            }}
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}