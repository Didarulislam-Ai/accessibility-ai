import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import CheckoutForm from "./CheckoutForm";
import { authOptions } from "@/lib/authOptions";

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutPage({
  searchParams: searchParamsPromise,
}: CheckoutPageProps) {
  const resolvedSearchParams = await searchParamsPromise;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }
  const plan = typeof resolvedSearchParams?.plan === 'string' ? resolvedSearchParams.plan : "";
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-8">Complete Your Subscription</h1>
          <CheckoutForm email={session.user.email} plan={plan} />
        </Card>
      </div>
    </div>
  );
} 