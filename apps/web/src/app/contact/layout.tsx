import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Bull & Bear Trading Journal",
  description:
    "Have a question or feedback about Bull & Bear? Get in touch with our team. We're here to help traders like you track and improve their performance.",
  alternates: {
    canonical: "https://bullandbear.pro/contact",
  },
  openGraph: {
    title: "Contact — Bull & Bear Trading Journal",
    description: "Reach out to the Bull & Bear team. We respond quickly.",
    url: "https://bullandbear.pro/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
