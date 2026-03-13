import Image from "next/image";
import Link from "next/link";

import { LandingFeatureShowcase } from "@/components/landing-feature-showcase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LandingPageProps = {
  searchParams?: Promise<{
    authError?: string;
    next?: string;
  }>;
};

async function getViewerState() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  } catch {
    return false;
  }
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const isAuthenticated = await getViewerState();
  const resolvedSearchParams = await searchParams;
  const primaryHref = isAuthenticated ? "/dashboard" : "/auth/signup";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Create account";
  const showUnauthorizedBanner = resolvedSearchParams?.authError === "unauthorized";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="relative isolate min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(45,212,191,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_48%,#07111f_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent_92%)]" />
        <div className="pointer-events-none absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl" />

        <section className="relative flex min-h-screen flex-col px-4 pb-8 pt-2 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col">
            <header className="animate-fade-up flex items-start justify-between gap-4 sm:items-center">
              <Link href="/" className="shrink-0">
                <Image
                  src="/BB_logo.png"
                  alt="Bull & Bear"
                  width={800}
                  height={800}
                  className="h-32 w-32 object-contain sm:h-40 sm:w-40"
                  priority
                />
              </Link>

              <div className="flex flex-wrap items-center justify-end gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur sm:px-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08] sm:px-5 sm:py-3"
                >
                  Sign in
                </Link>
                <Link
                  href={primaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 sm:px-5 sm:py-3"
                >
                  {primaryLabel}
                </Link>
              </div>
            </header>

            {showUnauthorizedBanner ? (
              <div className="animate-fade-up-delayed mt-6 flex justify-center">
                <div className="w-full max-w-[880px] rounded-[28px] border border-amber-200/16 bg-amber-300/10 px-5 py-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/76">
                    Protected page
                  </p>
                  <p className="mt-2 text-sm leading-7 text-amber-50 sm:text-base">
                    You must be connected to access this page.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex flex-1 flex-col justify-center pb-14 pt-14 sm:pt-18 lg:pb-20 lg:pt-24">
              <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
                <span className="animate-fade-up-delayed inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-300/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/86">
                  Trading journal and analytics
                </span>

                <h1 className="mt-8 text-balance text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-[4.8rem] lg:text-[7rem] xl:text-[8rem]">
                  <span className="animate-title-rise block">Trade. Review.</span>
                  <span className="animate-title-rise-delayed block text-cyan-100">Grow.</span>
                </h1>

                <p className="animate-fade-up-delayed-2 mt-6 max-w-[760px] text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                  Your trading journal, performance review desk, and screenshot-ready workspace. Review performance,
                  document execution, and turn raw trading history into a sharper process.
                </p>

                <div className="animate-fade-up-delayed-3 mt-10 flex flex-col items-center">
                  <span className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    Scroll to explore
                  </span>
                  <svg
                    className="h-8 w-8 animate-bounce text-white/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFeatureShowcase />
      </div>
    </main>
  );
}
