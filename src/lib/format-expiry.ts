export function getDaysUntilExpiry(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);

  const difference =
    expiry.getTime() - now.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

export function formatExpiry(expiryDate: string) {
  const days = getDaysUntilExpiry(expiryDate);

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