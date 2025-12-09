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
 * Check if event is 3+ months away from today
 * @param startDate Start date ISO string
 * @returns true if event is 3 or more months away
 */
export function isEarlyBirdEligible(startDate: string): boolean {
  const eventStart = new Date(startDate);
  const today = new Date();

  // Normalize to midnight to avoid time issues
  const eventMidnight = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
  );
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Calculate months difference
  const monthsDiff =
    (eventMidnight.getFullYear() - todayMidnight.getFullYear()) * 12 +
    (eventMidnight.getMonth() - todayMidnight.getMonth());

  // Also account for days in the month
  const daysDiff = eventMidnight.getDate() - todayMidnight.getDate();
  const adjustedMonthsDiff = monthsDiff + (daysDiff >= 0 ? 0 : -1);

  return adjustedMonthsDiff >= 3;
}

/**
 * Get early bird discount amount
 * -100 EUR/USD if 1 participant
 * -200 EUR/USD if 2 or more participants
 * Only applies if total participants (including current quantity) <= 5
 * @param quantity Number of participants in current order
 * @param participantCount Number of already confirmed participants
 * @returns Discount amount (0, 100, or 200)
 */
export function getEarlyBirdDiscount(
  quantity: number,
  participantCount: number,
): number {
  const totalParticipants = participantCount + quantity;

  // Early bird only applies to first 5 participants
  if (totalParticipants > 5) {
    return 0;
  }

  if (quantity === 1) {
    return 100;
  }

  if (quantity >= 2) {
    return 200;
  }

  return 0;
}

/**
 * Get price for a specific number of participants based on event duration
 * Optionally applies early bird discount if eligible
 * @param startISO Start date ISO string
 * @param endISO End date ISO string
 * @param quantity Number of participants
 * @param options Optional parameters for early bird pricing
 * @param options.participantCount Number of already confirmed participants (required for early bird)
 * @returns Price in EUR (with early bird discount applied if eligible)
 */
export function getPriceForQuantity(
  startISO?: string | null,
  endISO?: string | null,
  quantity: number = 1,
  options?: {
    participantCount?: number;
  },
): number {
  const days = getEventDurationDays(startISO, endISO);
  if (!days) return 0;

  let basePrice = 0;

  if (days === 2) {
    // 2-day event pricing
    if (quantity === 1) basePrice = 1500;
    else if (quantity === 2) basePrice = 2300;
    else if (quantity === 3) basePrice = 3000; // 3 for 2
    else {
      // For 4+, use price for 3 + unit price for each additional participant
      // This ensures the discount maxes out at 3 participants
      basePrice = 3000 + 1500 * (quantity - 3);
    }
  } else if (days === 3) {
    // 3-day event pricing
    if (quantity === 1) basePrice = 1750;
    else if (quantity === 2) basePrice = 2800;
    else if (quantity === 3) basePrice = 3500; // 3 for 2
    else {
      // For 4+, use price for 3 + unit price for each additional participant
      // This ensures the discount maxes out at 3 participants
      basePrice = 3500 + 1750 * (quantity - 3);
    }
  }

  // Apply early bird discount if eligible
  if (basePrice > 0 && startISO && options?.participantCount !== undefined) {
    const eligible = isEarlyBirdEligible(startISO);
    if (eligible) {
      const earlyBirdDiscount = getEarlyBirdDiscount(
        quantity,
        options.participantCount,
      );
      return Math.max(0, basePrice - earlyBirdDiscount);
    }
  }

  return basePrice;
}


