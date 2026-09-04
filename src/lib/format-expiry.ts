export function getDaysUntilExpiry(expiryDate: string | null) {
  if (!expiryDate) {
    return Number.POSITIVE_INFINITY;
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  const difference =
    expiry.getTime() - now.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

export function formatExpiry(expiryDate: string | null) {
  const days = getDaysUntilExpiry(expiryDate);

  if (!Number.isFinite(days)) {
    return "Expiry not available";
  }

  if (days < 0) {
    return "Expired";
  }

  if (days === 0) {
    return "Expires today";
  }

  if (days === 1) {
    return "1 day";
  }

  return `${days} days`;
}