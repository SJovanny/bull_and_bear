import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur Bull & Bear Trading Journal",
  description:
    "Got questions about Bull & Bear? Find answers about trade imports, subscription plans, data security, supported brokers like cTrader and MetaTrader, and more.",
  keywords: [
    "trading journal faq",
    "trading app help",
    "cTrader import help",
    "trading journal questions",
  ],
  alternates: {
    canonical: "https://bullandbear.pro/faq",
  },
  openGraph: {
    title: "FAQ — Questions fréquentes · Bull & Bear Trading Journal",
    description:
      "Answers to common questions about Bull & Bear trading journal: trade imports, subscription, data security, supported brokers like cTrader and MetaTrader.",
    url: "https://bullandbear.pro/faq",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bull & Bear - Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Bull & Bear Trading Journal",
    description:
      "Answers to common questions: trade imports, subscription, data security, cTrader & MetaTrader support.",
    images: ["/og-image.png"],
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Bull & Bear?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bull & Bear is a trading journal that helps you track, analyze, and improve your trading performance. You can log trades, review your statistics, and identify patterns in your behavior.",
      },
    },
    {
      "@type": "Question",
      name: "How does the free trial work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When you sign up, you get a 14-day free trial with access to all features. No payment is required until the trial ends. You can subscribe to a monthly or yearly plan at any time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I import my trades?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Go to the Journal page and click the import button. We support CSV and XLSX files from platforms like cTrader. You can also add trades manually.",
      },
    },
    {
      "@type": "Question",
      name: "Which brokers and platforms are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We currently support imports from cTrader (CSV and XLSX, in English and French). Support for more platforms like MetaTrader is planned.",
      },
    },
    {
      "@type": "Question",
      name: "Can I have multiple trading accounts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can create and manage multiple accounts (cash, margin, prop, sim) and switch between them. Each account tracks its own trades and statistics independently.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your data is stored on secure servers (Supabase / PostgreSQL) and is only accessible to you. We never share or sell your data. You can delete your account and all associated data at any time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I cancel my subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Go to the Pricing page and click 'Manage subscription'. This opens the Stripe customer portal where you can cancel, change your plan, or update your payment method.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get a refund?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you're not satisfied within the first 7 days of your paid subscription, contact us by email and we'll process a full refund.",
      },
    },
  ],
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={FAQ_SCHEMA} />
      {children}
    </>
  );
}
