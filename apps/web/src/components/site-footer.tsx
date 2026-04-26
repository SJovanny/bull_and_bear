import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#07111f] px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/BB_logo.png"
                alt="Bull & Bear"
                width={200}
                height={200}
                className="h-48 w-48 object-contain"
              />
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.links.product")}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href="#a-propos" className="text-sm text-slate-400 transition hover:text-cyan-400">
                  {t("footer.links.about")}
                </a>
              </li>
              <li>
                <a href="#fonctionnalites" className="text-sm text-slate-400 transition hover:text-cyan-400">
                  {t("footer.links.features")}
                </a>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-slate-400 transition hover:text-cyan-400">
                  {t("landing.nav.login")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.links.legal")}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/legal/privacy-policy" className="text-sm text-slate-400 transition hover:text-cyan-400">
                  {t("footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-slate-400 transition hover:text-cyan-400">
                  {t("footer.links.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} Bull & Bear. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
