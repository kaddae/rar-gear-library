import type {
  CategoryName,
  ConditionKey,
  Copy,
  CopyStatus,
  GearItem,
  SeasonKey,
} from "@/lib/schema";

export * from "@/lib/schema";

/** A borrower asks for a KIND of thing, and how many: three pairs of panniers. */
export type Line = { itemId: string; qty: number };

/** A hold carries contact details, so its cloud document is members-only. */
export type Hold = {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  shift: string;
  when: string;
  note: string;
  /** one line per kind of thing; crew assigns the actual copies at handover */
  lines: Line[];
  status: "pending" | "fulfilled" | "cancelled";
  createdAt: string;
};

/** Loans are public — the wall reads "out" from them — so a loan carries a
 *  first name and nothing else about the person. `tokenKey` is a hash of the
 *  trip link, so a public loan can be matched to a link without publishing it. */
export type Loan = {
  id: string;
  holdId: string;
  borrowerFirst: string;
  out: string;
  due: string;
  status: "open" | "closed";
  tokenKey: string;
  items: { copyId: string; returnedAt: string | null }[];
};

/** The private half of a loan: how to reach them, and their trip link. */
export type LoanContact = { id: string; loanId: string; email: string; token: string };

export type Story = {
  id: string;
  loanId: string;
  firstName: string;
  itemIds: string[];
  text: string;
  photo?: string;
  hidden: boolean;
  createdAt: string;
};

const DAY = 86400000;
export const iso = (n: number) => new Date(Date.now() + n * DAY).toISOString();
export const day = (n: number) => new Date(Date.now() + n * DAY).toISOString().slice(0, 10);

const LETTERS = "abcdefghijklmnop";

/** copies("BP-01", ["light", ["well", { status: "repair", note: "…" }]]) */
export function copies(
  num: string,
  specs: Array<ConditionKey | [ConditionKey, Partial<Copy>]>,
): Copy[] {
  return specs.map((spec, n) => {
    const [condition, over] = Array.isArray(spec) ? spec : [spec, {}];
    const tag = `${num}${LETTERS[n]}`;
    return {
      id: `c-${tag.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      tag,
      condition,
      status: "circulating" as CopyStatus,
      acquired: "",
      price: 0,
      source: "",
      note: "",
      ...over,
    };
  });
}

type ItemSeed = Partial<GearItem> & {
  num: string;
  name: string;
  category: CategoryName;
  desc: string;
  copies: Copy[];
};

const it = (o: ItemSeed): GearItem => ({
  id: `i-${o.num.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
  brand: "",
  model: "",
  mount: "",
  size: "",
  season: "any" as SeasonKey,
  care: "",
  returnInfo: "Back at the shop during any open shift.",
  requiresTraining: false,
  manualUrl: "",
  listingUrl: "",
  replacement: 0,
  weight: 0,
  weightUnit: "lb",
  width: 0,
  height: 0,
  depth: 0,
  dimUnit: "in",
  tags: [],
  loanDays: null,
  ...o,
});

export const SEED_ITEMS: GearItem[] = [
  it({
    num: "BP-01", name: "Frame bag, full triangle", brand: "Rockgeist", model: "Mr. Fusion",
    category: "Bikepacking + Touring", mount: "Frame triangle", size: "Fits 54–56cm diamond frames",
    desc: "Holds tools, food, a 2L bladder. Zips from both sides so you can reach it riding.",
    care: "Shake the crumbs out. Wipe with a damp rag.", returnInfo: "Dry, empty, both straps on.",
    replacement: 180, weight: 1.1, tags: ["Good for a first trip"],
    copies: copies("BP-01", ["light", "well"]),
  }),
  it({
    num: "BP-02", name: "Handlebar roll, 15L", brand: "Revelate", model: "Sweetroll",
    category: "Bikepacking + Touring", mount: "Handlebar", size: "15L · needs ~42cm of clear bar",
    desc: "Dry-bag roll for a sleeping bag and pad.",
    care: "Dry it fully open — a damp roll grows things.", replacement: 150, weight: 1.4,
    tags: ["Waterproof", "Good for a first trip"], copies: copies("BP-02", ["light", "well"]),
  }),
  it({
    num: "BP-03", name: "Seat pack, 14L", brand: "Ortlieb", model: "Seat-Pack",
    category: "Bikepacking + Touring", mount: "Seatpost", size: "14L · wants 20cm of exposed post",
    desc: "Waterproof, no rack needed. Swallows more than it looks like it will.",
    care: "Rinse road salt off the buckle. Don't fold the closure wet.",
    replacement: 190, weight: 1.0, tags: ["Waterproof"], copies: copies("BP-03", ["new", "light"]),
  }),
  it({
    num: "BP-04", name: "Fork cages, pair", brand: "Salsa", model: "Anything Cage HD",
    category: "Bikepacking + Touring", mount: "Fork", size: "Holds a 1.5L bottle or a fuel can each",
    desc: "Bolt-on cages for water, fuel, or a tent body. Straps included.",
    care: "Check the bolts are snug before you ride off.", returnInfo: "Both straps back with the cages.",
    replacement: 70, tags: ["Needs eyelets"], copies: copies("BP-04", ["light", "light", "well"]),
  }),
  it({
    num: "BP-05", name: "Stem bags, pair", brand: "Swift Industries", model: "Sidekick",
    category: "Bikepacking + Touring", mount: "Stem", size: "Fits a 32oz bottle",
    desc: "Snack and bottle holders either side of the stem. No tools to fit.",
    care: "Wipe out spills — these get sticky fast.", replacement: 60,
    tags: ["Good for a first trip"],
    copies: copies("BP-05", ["well", ["rough", { status: "repair", note: "Velcro collar shot — new one ordered" }]]),
  }),
  it({
    num: "BP-06", name: "Rear rack", brand: "Tubus", model: "Logo Evo",
    category: "Bikepacking + Touring", mount: "Rear rack", size: "Steel · rated to 26kg",
    desc: "The workhorse. Needs frame eyelets — ask us if you're not sure.",
    care: "Nothing to do but bring the hardware back.", returnInfo: "All four bolts with it.",
    replacement: 130, weight: 1.6, tags: ["Needs eyelets"], copies: copies("BP-06", ["light", "well"]),
  }),
  it({
    num: "BP-07", name: "Panniers, pair, 40L", brand: "Ortlieb", model: "Back-Roller Classic",
    category: "Bikepacking + Touring", mount: "Rear rack", size: "40L the pair",
    desc: "The easiest way to carry a lot. Waterproof, clips on and off in a second.",
    care: "Rinse and dry inside out.", replacement: 200, weight: 4.0,
    tags: ["Waterproof", "Needs a rack", "Good for a first trip"],
    copies: copies("BP-07", ["light", "well", "well"]),
  }),
  it({
    num: "AC-01", name: "Light set, front + rear", brand: "Cygolite", model: "Metro Plus 800",
    category: "Bike Accessories", mount: "Handlebar", size: "800 lumens front",
    desc: "USB rechargeable, enough for unlit road at night.",
    care: "Charge it before you bring it back if you can.", replacement: 90, loanDays: 7,
    copies: copies("AC-01", ["light", "well", "well", ["rough", { note: "rear mount cracked, zip-tied" }]]),
  }),
  it({
    num: "AC-02", name: "Repair kit: pump, tubes, levers", brand: "Shop-built", model: "",
    category: "Bike Accessories", mount: "Frame triangle", size: "Two 700c tubes",
    desc: "Mini pump, two tubes, patch kit, tire levers, multitool, in a zip pouch.",
    care: "Use what you need — that's what it's for.",
    returnInfo: "Tell us what you used so we can restock it.", replacement: 55, loanDays: 7,
    tags: ["Good for a first trip"], copies: copies("AC-02", ["light", "light", "well", "well"]),
  }),
  it({
    num: "AC-03", name: "Folding lock", brand: "Abus", model: "Bordo 6000",
    category: "Bike Accessories", mount: "Frame triangle", size: "90cm",
    desc: "Folding lock with frame mount and two keys.",
    care: "A drop of lube in the cylinder if it's stiff.", returnInfo: "Both keys come back.",
    replacement: 95, weight: 2.4, copies: copies("AC-03", ["light", "well"]),
  }),
  it({
    num: "CP-01", name: "Tent, 2-person", brand: "REI", model: "Half Dome SL 2+",
    category: "Camping", size: "2-person · 4.5 lb packed", season: "three",
    desc: "Freestanding, footprint and stakes included. Roomy for one, fine for two.",
    care: "Never store it packed wet.", returnInfo: "Set it up at home to dry first. All 8 stakes.",
    replacement: 250, weight: 4.5, tags: ["Good for a first trip"],
    copies: copies("CP-01", ["light", "well", "well"]),
  }),
  it({
    num: "CP-02", name: "Sleeping bag, 20°F", brand: "Kelty", model: "Cosmic 20",
    category: "Camping", size: "Rated 20°F · regular length", season: "shoulder",
    desc: "Synthetic, warm into the low 30s for most people. Stuff sack included.",
    care: "Store it loose at home, not compressed.", returnInfo: "In the stuff sack. Wash only if we ask.",
    replacement: 140, weight: 2.9, copies: copies("CP-02", ["light", "light", "well", "well"]),
  }),
  it({
    num: "CP-03", name: "Sleeping pad, insulated", brand: "Therm-a-Rest", model: "NeoAir XLite",
    category: "Camping", size: "R-value 4.2 · regular", season: "shoulder",
    desc: "Inflatable, packs down to a water-bottle size.",
    care: "Wipe it down, leave the valve open, roll loosely.", replacement: 110, weight: 0.9,
    tags: ["Packs small"], copies: copies("CP-03", ["new", "light", "light", "well"]),
  }),
  it({
    num: "CP-04", name: "Camp stove + pot", brand: "MSR", model: "PocketRocket 2",
    category: "Camping", size: "1L pot", season: "any",
    desc: "Screw-on canister stove and pot. Fuel not included — Bradley St keeps some.",
    care: "Scrub the pot before it comes back.", returnInfo: "Stove in its case.",
    requiresTraining: true, replacement: 75, weight: 0.6, tags: ["Packs small"],
    copies: copies("CP-04", ["light", "well", "well"]),
  }),
  it({
    num: "BK-01", name: "Backpacking pack, 50L", brand: "Osprey", model: "Atmos AG 50",
    category: "Backpacking", size: "50L · fits M/L torso", season: "three",
    desc: "For hike-a-bike trips, or when the bike stays home.",
    care: "Empty every pocket and shake it out.", replacement: 190, weight: 4.6,
    copies: copies("BK-01", ["light", "well"]),
  }),
  it({
    num: "BD-01", name: "Crash pad", brand: "Organic", model: "Simple Pad",
    category: "Bouldering Pads", size: '36" × 48" × 4"',
    desc: "Foldable bouldering pad with shoulder straps. Fits on a trailer or in a car.",
    care: "Brush the dirt off before it comes inside.", replacement: 240, weight: 11,
    width: 36, height: 48, depth: 4, copies: copies("BD-01", ["well", ["well", { status: "missing", note: "out since the June trip — Kai is asking around" }]]),
  }),
];

export const SEED_HOLDS: Hold[] = [
  {
    id: "h1",
    name: "Nadia Ferreira",
    email: "nadia.f@example.com",
    phone: "203-555-0142",
    group: "RAR New Haven",
    shift: "Thursday, 4–7pm",
    when: "or most Saturday mornings",
    note: "First overnight ever. I've never used a camp stove, would love thirty seconds of showing me.",
    lines: [
      { itemId: "i-bp01", qty: 1 },
      { itemId: "i-bp04", qty: 2 },
      { itemId: "i-cp04", qty: 1 },
    ],
    status: "pending",
    createdAt: iso(-2),
  },
];

export const SEED_LOANS: Loan[] = [
  {
    id: "l1",
    holdId: "",
    borrowerFirst: "Nadia",
    out: iso(-6),
    due: iso(8),
    status: "open",
    tokenKey: "plain:demo-nadia-1",
    items: [
      { copyId: "c-cp01a", returnedAt: null },
      { copyId: "c-cp03a", returnedAt: null },
    ],
  },
];

export const SEED_LOAN_CONTACTS: LoanContact[] = [
  { id: "lc1", loanId: "l1", email: "nadia.f@example.com", token: "demo-nadia-1" },
];

export const SEED_STORIES: Story[] = [
  {
    id: "s1",
    loanId: "past-1",
    firstName: "Nadia",
    itemIds: ["i-bp03", "i-bp02"],
    text: "Shoreline Greenway out to Hammonasset, camped, rode back before the heat. First time I've slept outside off a bike. The seat pack swallowed way more than I expected.",
    hidden: false,
    createdAt: iso(-24),
  },
  {
    id: "s2",
    loanId: "past-2",
    firstName: "Kai",
    itemIds: ["i-bp04", "i-cp04"],
    text: "Farmington Canal trail up to Cheshire and back, coffee on the stove at the trailhead. Each fork cage takes a 1.5L bottle with room for a fuel can.",
    hidden: false,
    createdAt: iso(-40),
  },
];