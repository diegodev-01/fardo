import { model, models, Schema } from "mongoose";
import type { ClaimStatus } from "@/lib/domain/claims";

export interface ILiveSession {
  _id: string;
  name: string;
  status: "ACTIVE" | "ENDED";
  startedAt: Date;
  endedAt?: Date | null;
  createdBy?: string;
}

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "ENDED"], default: "ACTIVE" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    createdBy: { type: String },
  },
  { timestamps: true },
);

export const LiveSessionModel =
  models.LiveSession || model("LiveSession", LiveSessionSchema);

export interface IClaim {
  _id: string;
  sessionId: string;
  eventId: string;
  /** platform handle of the commenter */
  user: string;
  code: string;
  garmentId: string;
  /** platform timestamp of the comment (epoch ms) */
  ts: number;
  text: string;
  status: ClaimStatus;
  customerId?: string;
  saleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    sessionId: { type: String, required: true },
    eventId: { type: String, required: true },
    user: { type: String, required: true },
    code: { type: String, required: true },
    garmentId: { type: String, required: true },
    ts: { type: Number, required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "QUEUED", "CONFIRMED", "PAID", "RELEASED"],
      default: "PENDING",
    },
    customerId: { type: String },
    saleId: { type: String },
  },
  { timestamps: true },
);

// Idempotent ingestion: the same platform event is stored once per session.
ClaimSchema.index({ sessionId: 1, eventId: 1 }, { unique: true });
// Fair assignment: at most one holder per item per session. The database
// enforces this, so two concurrent inserts cannot both win.
ClaimSchema.index(
  { sessionId: 1, code: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["PENDING", "CONFIRMED", "PAID"] } },
  },
);
ClaimSchema.index({ sessionId: 1, status: 1, ts: 1 });

export const ClaimModel = models.Claim || model("Claim", ClaimSchema);
