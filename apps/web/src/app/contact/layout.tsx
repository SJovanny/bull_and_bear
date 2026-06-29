import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Contact — Get in Touch with the Bull & Bear Team",
  description:
    "Have a question or feedback about Bull & Bear? Get in touch with our support team. We help traders track, analyze and improve their performance. We respond within 24–48 hours.",
  alternates: {
    canonical: "https://www.bullandbear.pro/contact",
  },
  openGraph: {
    type: "website",
    siteName: "Bull & Bear",
    title: "Contact — Get in Touch with the Bull & Bear Team",
    description:
      "Have a question or feedback about Bull & Bear trading journal? Reach out to our team. We help traders track and improve their performance. We respond within 24–48 hours.",
    url: "https://www.bullandbear.pro/contact",
    images: [{ url: "https://www.bullandbear.pro/og-image.png", width: 1200, height: 630, alt: "Bull & Bear - Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Bull & Bear Trading Journal",
    description:
      "Reach out to the Bull & Bear team. We help traders track and improve their performance. Response within 24–48 hours.",
    images: ["https://www.bullandbear.pro/og-image.png"],
  },
};

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://www.bullandbear.pro/contact#webpage",
  name: "Contact Bull & Bear",
  url: "https://www.bullandbear.pro/contact",
  description:
    "Contact the Bull & Bear team for support, feedback or questions about the trading journal.",
  mainEntity: {
    "@id": "https://www.bullandbear.pro/#organization",
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
