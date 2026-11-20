import { describe, expect, it } from "vitest";
import { parseClaim } from "@/lib/domain/comment-parser";
import { pickWinners } from "@/lib/domain/claims";
import { SimulatorProvider } from "./simulator";

describe("SimulatorProvider", () => {
  const make = () => {
    let i = 0;
    return new SimulatorProvider({ codes: ["A1", "7"], rng: () => ((i++ * 37) % 100) / 100, now: () => 1000 });
  };
  it("produces unique event ids", () => {
    const ids = make().generate(50).map((c) => c.eventId);
    expect(new Set(ids).size).toBe(50);
  });
  it("race yields one deterministic winner whatever the order", () => {
    const [x, y] = make().race("A1");
    for (const order of [[x, y], [y, x]]) {
      const events = order.map((c) => ({ eventId: c.eventId, user: c.user, ts: c.ts, code: parseClaim(c.text)!.code }));
      expect(pickWinners(events).get("A1")?.user).toBe("ana_live");
    }
  });
  it("emits through start/stop", async () => {
    const p = new SimulatorProvider({ codes: ["1"], intervalMs: 5 });
    const got: string[] = [];
    await p.start((c) => void got.push(c.eventId));
    await new Promise((r) => setTimeout(r, 40));
    await p.stop();
    const n = got.length;
    expect(n).toBeGreaterThan(0);
    await new Promise((r) => setTimeout(r, 20));
    expect(got.length).toBe(n);
  });
});
