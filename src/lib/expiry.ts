export type ExpiryEvidence = {
  expiryDate?: string | null;
  bestBeforeDate?: string | null;
  manufacturingDate?: string | null;
  shelfLifeDays?: number | null;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function deriveExpiryDate(evidence: ExpiryEvidence): string | null {
  const explicitDate = parseDate(evidence.expiryDate) ?? parseDate(evidence.bestBeforeDate);
  if (explicitDate) {
    return explicitDate.toISOString().slice(0, 10);
  }

  const manufacturingDate = parseDate(evidence.manufacturingDate);
  const shelfLifeDays = evidence.shelfLifeDays;
  if (!manufacturingDate || !Number.isFinite(shelfLifeDays) || !shelfLifeDays || shelfLifeDays <= 0) {
    return null;
  }

  manufacturingDate.setUTCDate(manufacturingDate.getUTCDate() + shelfLifeDays);
  return manufacturingDate.toISOString().slice(0, 10);
}
