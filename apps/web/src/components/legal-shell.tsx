import Link from "next/link";
import Image from "next/image";

type LegalShellProps = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalShell({ title, subtitle, lastUpdated, children }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-300">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/BB_logo.png" alt="Bull & Bear" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-white">Bull &amp; Bear</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 transition hover:text-cyan-400">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-white/10 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{subtitle}</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-slate-500">Dernière mise à jour : {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-headings:font-semibold prose-a:text-cyan-400 prose-strong:text-white prose-li:text-slate-300 prose-p:text-slate-300 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Bull &amp; Bear. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy-policy" className="transition hover:text-cyan-400">Politique de confidentialité</Link>
            <Link href="/legal/terms" className="transition hover:text-cyan-400">Conditions d&apos;utilisation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
