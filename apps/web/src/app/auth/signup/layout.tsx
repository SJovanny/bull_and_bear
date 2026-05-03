import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Start Your Free Trading Journal",
  description:
    "Sign up for Bull & Bear and get a free 14-day trial. Start tracking your trades, analyzing your performance, and becoming a more profitable trader today.",
  keywords: [
    "trading journal signup",
    "free trading journal trial",
    "create trading account",
    "track trades free",
  ],
  alternates: {
    canonical: "https://bullandbear.pro/auth/signup",
  },
  openGraph: {
    title: "Create Account — Bull & Bear Free Trading Journal",
    description:
      "Start your free 14-day trial. No credit card required. Join traders already improving with Bull & Bear.",
    url: "https://bullandbear.pro/auth/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
