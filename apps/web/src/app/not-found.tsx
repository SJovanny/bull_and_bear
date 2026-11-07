import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — Bull & Bear",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-black text-brand-500 font-mono">404</p>
        <h1 className="mt-4 text-xl font-bold text-primary font-sans">Page not found</h1>
        <p className="mt-2 text-sm text-secondary font-sans">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
