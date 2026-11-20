import type { CommentHandler, LiveComment, LiveEventProvider } from "./provider";

export interface SimulatorOptions {
  /** item codes viewers claim, e.g. ["A1","A2","7"] */
  codes: string[];
  users?: string[];
  /** 0..1, injectable for deterministic tests */
  rng?: () => number;
  now?: () => number;
  intervalMs?: number;
}

const DEFAULT_USERS = ["ana_live", "luis.k", "mari_88", "carlos", "sofi", "pepe_tv"];

// Typos, accents, emoji and non-claims seen in real chats.
const TEMPLATES: ((code: string) => string)[] = [
  (c) => `mío ${c}`,
  (c) => `mio ${c}`,
  (c) => `MIO ${c}!!`,
  (c) => `mi0 ${c}`,
  (c) => `🔥 mío #${c} 🔥`,
  (c) => `  mio   ${c} por favor`,
  () => "hola!! que linda ropa",
  () => "cuanto cuesta?",
  (c) => `quiero mio ${c}`, // not a claim: keyword must lead
];

export class SimulatorProvider implements LiveEventProvider {
  readonly name = "simulator";
  private timer: ReturnType<typeof setInterval> | null = null;
  private seq = 0;
  private readonly rng: () => number;
  private readonly now: () => number;
  private readonly users: string[];

  constructor(private readonly opts: SimulatorOptions) {
    this.rng = opts.rng ?? Math.random;
    this.now = opts.now ?? Date.now;
    this.users = opts.users ?? DEFAULT_USERS;
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.min(arr.length - 1, Math.floor(this.rng() * arr.length))];
  }

  next(): LiveComment {
    const text = this.pick(TEMPLATES)(this.pick(this.opts.codes));
    return {
      eventId: `sim-${this.now()}-${++this.seq}`,
      user: this.pick(this.users),
      text,
      ts: this.now(),
    };
  }

  /** Stateless batch for serverless routes (a timer cannot persist there). */
  generate(count: number): LiveComment[] {
    return Array.from({ length: count }, () => this.next());
  }

  /** A deterministic race: two viewers claim the same code at the same moment. */
  race(code: string): LiveComment[] {
    const ts = this.now();
    return [
      { eventId: `sim-race-${ts}-b`, user: "pepe_tv", text: `mío ${code}`, ts },
      { eventId: `sim-race-${ts}-a`, user: "ana_live", text: `mio ${code}`, ts },
    ];
  }

  async start(onComment: CommentHandler): Promise<void> {
    if (this.timer) return;
    this.timer = setInterval(() => void onComment(this.next()), this.opts.intervalMs ?? 1500);
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
