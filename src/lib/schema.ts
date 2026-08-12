/** Every picklist in the library lives here. Edit a list once and the crew
 *  form, the paste importer, the public shelf, and the filters all follow.
 *
 *  Two levels on purpose:
 *    GearItem — the words and specs for a kind of thing (BP-01, "Frame bag")
 *    Copy     — one physical object with your sticker on it (BP-01a)
 *  Condition and status live on the COPY. "Out" is never stored; it is
 *  derived from open loans, so it can't drift from what's really on the wall.
 */

export const CATEGORIES = [
  { name: "Bikepacking + Touring", tint: "#D1D1E4" },
  { name: "Bike Accessories", tint: "#D1E4DD" },
  { name: "Camping", tint: "#E4D1D1" },
  { name: "Backpacking", tint: "#E3DECD" },
  { name: "Bouldering Pads", tint: "#DCD3BE" },
] as const;
export type CategoryName = (typeof CATEGORIES)[number]["name"];

export const MOUNTS = [
  "",
  "Frame triangle",
  "Handlebar",
  "Seatpost",
  "Fork",
  "Stem",
  "Top tube",
  "Rear rack",
  "Front rack",
  "Doesn't mount",
] as const;
export type Mount = (typeof MOUNTS)[number];

/** Wear. Slow-moving, casual words — never blocks a loan on its own. */
export const CONDITIONS = [
  { key: "new", label: "Brand new", hint: "unused, or close" },
  { key: "light", label: "Lightly used", hint: "a season or two, nothing wrong" },
  { key: "well", label: "Well used", hint: "scuffed and proven, works fine" },
  { key: "rough", label: "Rough", hint: "works, but say so at the counter" },
] as const;
export type ConditionKey = (typeof CONDITIONS)[number]["key"];

/** Availability. Fast-moving, set by crew per copy. */
export const COPY_STATUSES = [
  { key: "circulating", label: "In circulation", hint: "lends normally" },
  { key: "repair", label: "Needs work", hint: "on the stand, not lendable" },
  { key: "missing", label: "Missing", hint: "hasn't come back" },
  { key: "retired", label: "Retired", hint: "off the wall for good" },
] as const;
export type CopyStatus = (typeof COPY_STATUSES)[number]["key"];

/** Temperature ranges are the whole point — they're what a first-timer
 *  needs and what the trip guide will sort on later. */
export const SEASONS = [
  { key: "any", label: "Any season", range: "weather doesn't change much" },
  { key: "summer", label: "Summer", range: "nights above 50°F" },
  { key: "three", label: "3-season", range: "nights 30–60°F" },
  { key: "shoulder", label: "Fall / spring", range: "nights 25–45°F" },
  { key: "winter", label: "Winter", range: "nights below 25°F" },
] as const;
export type SeasonKey = (typeof SEASONS)[number]["key"];

export const TAGS = [
  "Good for a first trip",
  "Waterproof",
  "Packs small",
  "Heavy",
  "Needs a rack",
  "Needs eyelets",
  "Kid-sized",
] as const;
export type TagName = (typeof TAGS)[number];

export const WEIGHT_UNITS = ["lb", "oz", "kg", "g"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const DIM_UNITS = ["in", "cm"] as const;
export type DimUnit = (typeof DIM_UNITS)[number];

export type Copy = {
  id: string;
  /** the sticker on the thing — editable without orphaning history */
  tag: string;
  condition: ConditionKey;
  status: CopyStatus;
  /** yyyy-mm-dd, "" when nobody remembers */
  acquired: string;
  price: number;
  /** donated by whom, or which grant bought it */
  source: string;
  /** this copy's quirk: "zipper sticks", "left pole taped" */
  note: string;
};

export type GearItem = {
  id: string;
  num: string;
  name: string;
  brand: string;
  model: string;
  category: CategoryName;
  mount: Mount;
  /** frame size, capacity, temp rating — the thing people ask before showing up */
  size: string;
  season: SeasonKey;
  desc: string;
  /** how to treat it while you have it */
  care: string;
  /** what has to be true when it comes back */
  returnInfo: string;
  /** crew shows you how before it leaves */
  requiresTraining: boolean;
  manualUrl: string;
  listingUrl: string;
  replacement: number;
  weight: number;
  weightUnit: WeightUnit;
  width: number;
  height: number;
  depth: number;
  dimUnit: DimUnit;
  tags: TagName[];
  /** overrides the 14-day default; null means use the default */
  loanDays: number | null;
  photo?: string;
  copies: Copy[];
};

export const conditionLabel = (k: ConditionKey) =>
  CONDITIONS.find((c) => c.key === k)?.label ?? k;
export const seasonLabel = (k: SeasonKey) => SEASONS.find((s) => s.key === k)?.label ?? k;
export const seasonRange = (k: SeasonKey) => SEASONS.find((s) => s.key === k)?.range ?? "";
export const statusLabel = (k: CopyStatus) =>
  COPY_STATUSES.find((s) => s.key === k)?.label ?? k;
export const categoryTint = (name: string) =>
  CATEGORIES.find((c) => c.name === name)?.tint ?? "var(--muted)";

export const dimsText = (i: GearItem) =>
  i.width || i.height || i.depth
    ? [i.width, i.height, i.depth].filter(Boolean).join(" × ") + " " + i.dimUnit
    : "";
export const weightText = (i: GearItem) => (i.weight ? `${i.weight} ${i.weightUnit}` : "");