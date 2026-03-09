"use client";

type MetricLabelProps = {
  label: string;
  description?: string;
};

export function MetricLabel({ label, description }: MetricLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-inherit">{label}</span>
      {description ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            aria-label={`More information about ${label}`}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface-2 text-[10px] font-bold text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            i
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-border bg-surface-1 px-3 py-2 text-[11px] normal-case tracking-normal text-secondary shadow-lg group-hover:block group-focus-within:block">
            {description}
          </span>
        </span>
      ) : null}
    </div>
  );
}
