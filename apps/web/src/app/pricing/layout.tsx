import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Pricing — Free 14-Day Trial · Bull & Bear Trading Journal",
  description:
    "Start tracking your trades for free. Bull & Bear offers a 14-day free trial with full access. Choose a monthly or yearly plan to continue improving your trading.",
  keywords: [
    "trading journal pricing",
    "free trading journal",
    "trading app subscription",
    "trade tracker plans",
  ],
  alternates: {
    canonical: "https://bullandbear.pro/pricing",
  },
  openGraph: {
    title: "Pricing — Free 14-Day Trial · Bull & Bear Trading Journal",
    description:
      "Start with a free 14-day trial. No credit card required. Full access to all features: trade tracking, statistics, journal, cTrader import and more.",
    url: "https://bullandbear.pro/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bull & Bear - Trading Journal Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Free 14-Day Trial · Bull & Bear",
    description:
      "Start with a free 14-day trial. No credit card required. Full access to all features: trade tracking, statistics, journal, cTrader import.",
    images: ["/og-image.png"],
  },
};

const PRICING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Bull & Bear Trading Journal",
  description:
    "A trading journal and analytics platform for day traders. Track trades, review statistics, keep a daily journal. Supports cTrader and MetaTrader imports.",
  url: "https://bullandbear.pro/pricing",
  brand: {
    "@type": "Brand",
    name: "Bull & Bear",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Free Trial",
      price: "0",
      priceCurrency: "EUR",
      description: "14-day free trial with access to all features. No credit card required.",
      availability: "https://schema.org/InStock",
      url: "https://bullandbear.pro/auth/signup",
    },
    {
      "@type": "Offer",
      name: "Monthly Plan",
      price: "2.99",
      priceCurrency: "EUR",
      description: "Full access to Bull & Bear, billed monthly.",
      availability: "https://schema.org/InStock",
      url: "https://bullandbear.pro/pricing",
    },
    {
      "@type": "Offer",
      name: "Yearly Plan",
      price: "26.99",
      priceCurrency: "EUR",
      description: "Full access to Bull & Bear, billed yearly. Save 25%.",
      availability: "https://schema.org/InStock",
      url: "https://bullandbear.pro/pricing",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "120",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={PRICING_SCHEMA} />
      {children}
    </>
  );
}
