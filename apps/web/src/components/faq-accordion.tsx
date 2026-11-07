"use client";

import { useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

type Props = {
  items: FaqItem[];
  contactTitle: string;
  contactDescription: string;
  email: string;
  labelCopy: string;
  labelCopied: string;
};

export function FaqAccordion({ items, contactTitle, contactDescription, email, labelCopy, labelCopied }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Accordion */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                <span>{item.q}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact section */}
      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <h3 className="text-base font-semibold text-slate-900">{contactTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{contactDescription}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-mono text-slate-900">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void copyEmail()}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {labelCopied}
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                {labelCopy}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
