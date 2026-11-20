/**
 * PENDING   holds the item, awaiting admin review
 * QUEUED    valid claim that lost the race; can be promoted if the holder is released
 * CONFIRMED approved (a sale exists), PAID paid, RELEASED discarded
 */
export type ClaimStatus = "PENDING" | "QUEUED" | "CONFIRMED" | "PAID" | "RELEASED";

export interface ClaimEvent {
  eventId: string;
  user: string;
  code: string;
  /** epoch ms of the comment as reported by the platform */
  ts: number;
}

/** Deterministic order: earliest timestamp, ties broken by eventId. */
export function compareClaimEvents(a: ClaimEvent, b: ClaimEvent): number {
  return a.ts - b.ts || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0);
}

/** First valid claimant per code, regardless of arrival order. */
export function pickWinners(events: ClaimEvent[]): Map<string, ClaimEvent> {
  const winners = new Map<string, ClaimEvent>();
  for (const e of [...events].sort(compareClaimEvents)) {
    if (!winners.has(e.code)) winners.set(e.code, e);
  }
  return winners;
}

const TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  PENDING: ["CONFIRMED", "RELEASED", "QUEUED"],
  QUEUED: ["PENDING", "RELEASED"],
  CONFIRMED: ["PAID", "RELEASED"],
  PAID: [],
  RELEASED: [],
};

export function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Statuses that hold the item (a RELEASED claim frees the code for others). */
export const ACTIVE_CLAIM_STATUSES: ClaimStatus[] = ["PENDING", "CONFIRMED", "PAID"];

/**
 * An out-of-order arrival (earlier platform timestamp, later delivery) takes the
 * item from a holder that is still PENDING. Reviewed claims are never displaced.
 */
export function shouldDisplace(
  incoming: ClaimEvent,
  holder: ClaimEvent & { status: ClaimStatus },
): boolean {
  return holder.status === "PENDING" && compareClaimEvents(incoming, holder) < 0;
}

/** Earliest queued claim, i.e. who should be offered the item next. */
export function nextInQueue<T extends ClaimEvent>(queued: T[]): T | undefined {
  return [...queued].sort(compareClaimEvents)[0];
}
