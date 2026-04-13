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
        <span className="relative inline-flex">
          <button
            type="button"
            aria-label={`More information about ${label}`}
            className="peer inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#2e2e2e] bg-surface-2 text-[10px] font-bold text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            ?
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 rounded-xl border border-[#2e2e2e] bg-surface-1 px-3 py-2 text-[11px] normal-case tracking-normal text-secondary shadow-lg peer-hover:block peer-focus-visible:block">
            {description}
          </span>
        </span>
      ) : null}
    </div>
  );
}
