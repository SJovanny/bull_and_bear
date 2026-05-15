import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Contact — Contactez l'équipe Bull & Bear Trading Journal",
  description:
    "Have a question or feedback about Bull & Bear? Get in touch with our support team. We help traders track, analyze and improve their performance. We respond within 24–48 hours.",
  alternates: {
    canonical: "https://bullandbear.pro/contact",
  },
  openGraph: {
    title: "Contact — Contactez l'équipe Bull & Bear Trading Journal",
    description:
      "Have a question or feedback about Bull & Bear trading journal? Reach out to our team. We help traders track and improve their performance. We respond within 24–48 hours.",
    url: "https://bullandbear.pro/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bull & Bear - Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Bull & Bear Trading Journal",
    description:
      "Reach out to the Bull & Bear team. We help traders track and improve their performance. Response within 24–48 hours.",
    images: ["/og-image.png"],
  },
};

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Bull & Bear",
  url: "https://bullandbear.pro/contact",
  description:
    "Contact the Bull & Bear team for support, feedback or questions about the trading journal.",
  mainEntity: {
    "@type": "Organization",
    name: "Bull & Bear",
    email: "bullandbear.journal@gmail.com",
    url: "https://bullandbear.pro",
    contactPoint: {
      "@type": "ContactPoint",
      email: "bullandbear.journal@gmail.com",
      contactType: "customer support",
      availableLanguage: ["French", "English"],
    },
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={CONTACT_SCHEMA} />
      {children}
    </>
  );
}
