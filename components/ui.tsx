"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Card ─────────────────────────────────────────────────────────── */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-3", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-slate-900", className)} {...props} />;
}

/* ── Section heading ──────────────────────────────────────────────── */
export function SectionTitle({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-600">{eyebrow}</div>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {right}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────────── */
type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral" }: { tone?: Tone }) {
  const colors: Record<Tone, string> = {
    neutral: "bg-slate-400",
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-sky-500",
  };
  return <span className={cn("inline-block size-2 rounded-full", colors[tone])} />;
}

/* ── Button ───────────────────────────────────────────────────────── */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ── KPI ──────────────────────────────────────────────────────────── */
export function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  const accent: Record<Tone, string> = {
    neutral: "text-slate-900",
    brand: "text-brand-700",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-sky-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight tnum", accent[tone])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </Card>
  );
}

/* ── Progress ─────────────────────────────────────────────────────── */
export function Progress({
  value,
  tone = "brand",
  className,
}: {
  value: number; // 0..100
  tone?: Tone;
  className?: string;
}) {
  const bar: Record<Tone, string> = {
    neutral: "bg-slate-400",
    brand: "bg-brand-600",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-sky-500",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", bar[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ── Confidence meter ─────────────────────────────────────────────── */
export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone: Tone = pct >= 90 ? "success" : pct >= 70 ? "warning" : "danger";
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} tone={tone} className="w-28" />
      <span className="text-xs font-medium text-slate-600 tnum">{pct}%</span>
    </div>
  );
}

/* ── Channel pill ─────────────────────────────────────────────────── */
export function ChannelPill({ channel }: { channel: "KSeF" | "ERP" | "Upload" }) {
  const map = {
    KSeF: { tone: "info" as Tone, label: "KSeF" },
    ERP: { tone: "brand" as Tone, label: "ERP" },
    Upload: { tone: "neutral" as Tone, label: "Upload" },
  };
  const c = map[channel];
  return (
    <Badge tone={c.tone}>
      <Dot tone={c.tone} />
      {c.label}
    </Badge>
  );
}
