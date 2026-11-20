/** A raw comment from a live platform, before any parsing. */
export interface LiveComment {
  /** unique per comment on the platform; used for idempotent ingestion */
  eventId: string;
  user: string;
  text: string;
  /** epoch ms as reported by the platform */
  ts: number;
}

export type CommentHandler = (comment: LiveComment) => void | Promise<void>;
