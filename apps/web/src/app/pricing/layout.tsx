import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free Trading Journal with 14-Day Trial",
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
    title: "Pricing — Bull & Bear Trading Journal",
    description:
      "Start with a free 14-day trial. No credit card required. Plans for every trader.",
    url: "https://bullandbear.pro/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
