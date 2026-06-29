import { PublicShell } from "@/components/public-shell";
import { CopyEmailButton } from "@/components/copy-email-button";
import { en } from "@/lib/i18n/translations/en";

const SUPPORT_EMAIL = "bullandbear.journal@gmail.com";

export default function ContactPage() {
  return (
    <PublicShell title={en["contact.title"]} subtitle={en["contact.subtitle"]}>
      <div className="mx-auto max-w-xl py-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-cyan-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <p className="mt-6 text-center text-base leading-relaxed text-slate-600">
          {en["contact.description"]}
        </p>

        {/* Email card */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {en["contact.email.label"]}
          </p>

          <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 font-mono text-sm text-slate-900">
              {SUPPORT_EMAIL}
            </span>

            <div className="flex gap-2">
              <CopyEmailButton
                email={SUPPORT_EMAIL}
                labelCopy={en["contact.copy"]}
                labelCopied={en["contact.copied"]}
              />

              {/* Mailto button */}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {en["contact.mailto"]}
              </a>
            </div>
          </div>
        </div>

        {/* Response time note */}
        <p className="mt-4 text-center text-sm text-slate-500">
          {en["contact.response"]}
        </p>
      </div>
    </PublicShell>
  );
}
