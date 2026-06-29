import Link from "next/link";
import Image from "next/image";
import { PricingInteractive } from "@/components/pricing-interactive";
import { en } from "@/lib/i18n/translations/en";

const FEATURES: (keyof typeof en)[] = [
  "pricing.feat.accounts",
  "pricing.feat.trades",
  "pricing.feat.journal",
  "pricing.feat.stats",
  "pricing.feat.import",
  "pricing.feat.export",
  "pricing.feat.support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-300">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/BB_logo.png" alt="Bull & Bear" width={64} height={64} className="h-16 w-16 object-contain" />
            <span className="font-semibold text-white">Bull &amp; Bear</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-cyan-400">
            {en["pricing.backToDashboard"]}
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{en["pricing.eyebrow"]}</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{en["pricing.title"]}</h1>
          <p className="mt-3 text-slate-400">{en["pricing.subtitle"]}</p>

          {/* Pricing card */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Bull &amp; Bear Pro</h2>
                <p className="mt-1 text-sm text-slate-400">{en["pricing.cardDesc"]}</p>
              </div>
            </div>

            {/* Interactive: interval toggle, dynamic price, CTA button */}
            <PricingInteractive />

            <hr className="my-6 border-white/10" />

            {/* Static feature list — server-rendered, visible to Googlebot */}
            <ul className="space-y-3 text-sm text-slate-300">
              {FEATURES.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {en[key]}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-xs text-slate-500">{en["pricing.footer"]}</p>
        </div>
      </main>
    </div>
  );
}
