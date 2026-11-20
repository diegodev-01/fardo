import { describe, expect, it } from "vitest";
import { canTransition, nextInQueue, pickWinners, shouldDisplace } from "./claims";

const ev = (eventId: string, user: string, code: string, ts: number) => ({ eventId, user, code, ts });

describe("pickWinners", () => {
  it("earliest timestamp wins regardless of arrival order", () => {
    const w = pickWinners([ev("2", "bob", "A1", 200), ev("1", "ana", "A1", 100), ev("3", "cy", "A2", 50)]);
    expect(w.get("A1")?.user).toBe("ana");
    expect(w.get("A2")?.user).toBe("cy");
  });
  it("ties broken by eventId deterministically", () => {
    const a = pickWinners([ev("b", "bob", "1", 10), ev("a", "ana", "1", 10)]);
    const b = pickWinners([ev("a", "ana", "1", 10), ev("b", "bob", "1", 10)]);
    expect(a.get("1")?.user).toBe("ana");
    expect(b.get("1")?.user).toBe("ana");
  });
});
describe("canTransition", () => {
  it("allows the happy path and release, blocks terminal", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "PAID")).toBe(true);
    expect(canTransition("PENDING", "PAID")).toBe(false);
    expect(canTransition("PAID", "RELEASED")).toBe(false);
  });
});
describe("displacement and queue", () => {
  it("earlier late arrival displaces a PENDING holder only", () => {
    const holder = { ...ev("2", "bob", "A1", 200), status: "PENDING" as const };
    expect(shouldDisplace(ev("1", "ana", "A1", 100), holder)).toBe(true);
    expect(shouldDisplace(ev("3", "cy", "A1", 300), holder)).toBe(false);
    expect(shouldDisplace(ev("1", "ana", "A1", 100), { ...holder, status: "CONFIRMED" })).toBe(false);
  });
  it("next in queue is the earliest", () => {
    expect(nextInQueue([ev("b", "x", "1", 30), ev("a", "y", "1", 20)])?.user).toBe("y");
    expect(nextInQueue([])).toBeUndefined();
  });
  it("queue transitions", () => {
    expect(canTransition("QUEUED", "PENDING")).toBe(true);
    expect(canTransition("QUEUED", "PAID")).toBe(false);
  });
});
