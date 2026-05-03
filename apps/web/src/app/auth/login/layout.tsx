import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Bull & Bear Trading Journal",
  description:
    "Sign in to your Bull & Bear account to access your trading journal, statistics, and performance analytics.",
  alternates: {
    canonical: "https://bullandbear.pro/auth/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
