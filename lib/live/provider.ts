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

/**
 * Source of live comments. Persistent connections (e.g. a TikTok connector)
 * cannot live in stateless serverless routes: run them in a worker process
 * that implements this interface and forwards comments to POST /api/live/ingest.
 */
export interface LiveEventProvider {
  readonly name: string;
  /** Begins emitting; resolves once started. */
  start(onComment: CommentHandler): Promise<void>;
  stop(): Promise<void>;
}
