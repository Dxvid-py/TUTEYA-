const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function normalizeToCOP(amount: number | string | null | undefined): number {
  const numeric =
    typeof amount === "string"
      ? Number(amount.replace(/[^\d.-]/g, ""))
      : Number(amount);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 45000;
  }
  if (numeric < 1000) {
    return Math.round(numeric * 3500);
  }
  return Math.round(numeric);
}

export function formatCOP(
  amount: number | string | null | undefined,
  options?: { perHour?: boolean; compact?: boolean }
): string {
  const value = normalizeToCOP(amount);
  const formatted = copFormatter.format(value);
  const base = options?.compact ? formatted : `${formatted} COP`;
  return options?.perHour ? `${base} / h` : base;
}
