import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Make Your Website Accessible to Everyone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Automated accessibility testing and compliance monitoring for WCAG, ADA, and AODA standards.
            Get detailed reports and step-by-step fixes for your website.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link 
              href="#pricing" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Accessibility Testing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="WCAG 2.0 Compliance"
              description="Full coverage of WCAG 2.0 Level A and AA requirements for comprehensive accessibility testing."
            />
            <FeatureCard 
              title="ADA & AODA Standards"
              description="Ensure compliance with ADA and AODA regulations through automated testing and reporting."
            />
            <FeatureCard 
              title="Step-by-Step Fixes"
              description="Get detailed instructions and code examples to fix accessibility issues quickly and effectively."
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Basic"
              price="$49"
              period="month"
              features={[
                "Up to 10 pages",
                "Basic accessibility checks",
                "Weekly scans",
                "Email support",
                "Basic reporting"
              ]}
              buttonText="Start Free Trial"
              highlighted={false}
            />
            <PricingCard
              title="Pro"
              price="$99"
              period="month"
              features={[
                "Up to 50 pages",
                "Advanced accessibility checks",
                "Daily scans",
                "Priority support",
                "Detailed reporting",
                "Custom scan schedules"
              ]}
              buttonText="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="$299"
              period="month"
              features={[
                "Unlimited pages",
                "Full WCAG 2.0 AA compliance",
                "Real-time monitoring",
                "24/7 support",
                "Advanced analytics",
                "Custom integrations",
                "Team collaboration"
              ]}
              buttonText="Contact Sales"
              highlighted={false}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make Your Website Accessible?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of websites that are now accessible to everyone.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  period, 
  features, 
  buttonText, 
  highlighted 
}: { 
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${highlighted ? 'border-blue-600' : 'border-gray-100'} p-8 relative`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600">/{period}</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={buttonText === "Contact Sales" ? "/contact" : "/dashboard"}
        className={`block text-center py-3 rounded-lg font-semibold transition ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
