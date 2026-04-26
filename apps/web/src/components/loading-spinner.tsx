"use client";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export default function LoadingSpinner({ text, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div
        className={`animate-spin rounded-full border-brand-500/30 border-t-brand-500 ${sizeClasses[size]}`}
      />
      {text && <p className="text-sm text-secondary">{text}</p>}
    </div>
  );
}
