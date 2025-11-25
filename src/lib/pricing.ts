export function getEventDurationDays(
  startISO?: string | null,
  endISO?: string | null,
): number | null {
  if (!startISO || !endISO) return null;

  const start = new Date(startISO);
  const end = new Date(endISO);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  // Normalize to midnight to avoid DST / timezone issues
  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endMidnight = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );

  const diffMs = endMidnight.getTime() - startMidnight.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Inclusive of both start and end days
  const totalDays = diffDays + 1;

  if (!Number.isFinite(totalDays) || totalDays <= 0) return null;

  return totalDays;
}

export function getPriceFromDates(
  startISO?: string | null,
  endISO?: string | null,
): number {
  const days = getEventDurationDays(startISO, endISO);
  if (!days) return 0;

  if (days === 2) return 1500;
  if (days === 3) return 1750;

  // For any unexpected duration, return 0 so it's clearly invalid
  return 0;
}

/**
 * Get price for a specific number of participants based on event duration
 * @param startISO Start date ISO string
 * @param endISO End date ISO string
 * @param quantity Number of participants (1, 2, or 3)
 * @returns Price in EUR
 */
export function getPriceForQuantity(
  startISO?: string | null,
  endISO?: string | null,
  quantity: number = 1,
): number {
  const days = getEventDurationDays(startISO, endISO);
  if (!days) return 0;

  if (days === 2) {
    // 2-day event pricing
    if (quantity === 1) return 1500;
    if (quantity === 2) return 2300;
    if (quantity === 3) return 3000; // 3 for 2
    // For 4+, use price for 3 + unit price for each additional participant
    // This ensures the discount maxes out at 3 participants
    return 3000 + 1500 * (quantity - 3);
  }

  if (days === 3) {
    // 3-day event pricing
    if (quantity === 1) return 1750;
    if (quantity === 2) return 2800;
    if (quantity === 3) return 3500; // 3 for 2
    // For 4+, use price for 3 + unit price for each additional participant
    // This ensures the discount maxes out at 3 participants
    return 3500 + 1750 * (quantity - 3);
  }

  return 0;
}


