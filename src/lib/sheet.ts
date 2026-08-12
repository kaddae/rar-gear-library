/** Reads a spreadsheet pasted straight out of Google Sheets — header row and
 *  all. Column ORDER doesn't matter; the header names do. One row = one
 *  physical thing. Rows that share a name + brand + model become copies of a
 *  single catalog entry, which is exactly how the shelf is modelled. */

import {
  CATEGORIES,
  CONDITIONS,
  COPY_STATUSES,
  DIM_UNITS,
  MOUNTS,
  SEASONS,
  TAGS,
  WEIGHT_UNITS,
  type CategoryName,
  type ConditionKey,
  type Copy,
  type CopyStatus,
  type DimUnit,
  type GearItem,
  type Mount,
  type SeasonKey,
  type TagName,
  type WeightUnit,
} from "@/lib/schema";

export type SheetResult = {
  items: GearItem[];
  rows: number;
  copies: number;
  unknown: string[];
  ok: boolean;
};

const HEADERS: Record<string, string> = {
  status: "status",
  number: "num",
  "item number": "num",
  "item #": "num",
  "#": "num",
  tag: "num",
  "item name": "name",
  name: "name",
  item: "name",
  model: "model",
  brand: "brand",
  description: "desc",
  desc: "desc",
  condition: "condition",
  "product listing url": "listingUrl",
  "listing url": "listingUrl",
  "product url": "listingUrl",
  image: "photo",
  "image url": "photo",
  photo: "photo",
  "original purchase date": "acquired",
  "purchase date": "acquired",
  acquired: "acquired",
  "purchase price": "price",
  price: "price",
  "replacement cost": "replacement",
  "replacement value": "replacement",
  replacement: "replacement",
  size: "size",
  weight: "weight",
  "weight unit": "weightUnit",
  width: "width",
  height: "height",
  depth: "depth",
  "dimension unit": "dimUnit",
  "dimensions unit": "dimUnit",
  "require training": "requiresTraining",
  "requires training": "requiresTraining",
  training: "requiresTraining",
  "user manual url": "manualUrl",
  "manual url": "manualUrl",
  manual: "manualUrl",
  "care information": "care",
  care: "care",
  "return information": "returnInfo",
  "return info": "returnInfo",
  categories: "category",
  category: "category",
  season: "season",
  mount: "mount",
  mounts: "mount",
  "mounts at": "mount",
  tags: "tags",
  "loan days": "loanDays",
  "loan length": "loanDays",
  source: "source",
  "donated by": "source",
  note: "note",
  notes: "note",
};

function grid(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (ch !== "\r") cur += ch;
  }
  row.push(cur);
  rows.push(row);
  return rows
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ""));
}

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9# ]/g, "").replace(/\s+/g, " ").trim();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const num = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;
const yes = (s: string) => /^(y|yes|true|x|1|✓)$/i.test(s.trim());

function match<T extends string>(value: string, options: readonly { key: T; label: string }[], fallback: T): T {
  const v = slug(value);
  if (!v) return fallback;
  return (
    options.find((o) => slug(o.key) === v || slug(o.label) === v)?.key ??
    options.find((o) => slug(o.label).includes(v) || v.includes(slug(o.key)))?.key ??
    fallback
  );
}

function matchCategory(value: string): CategoryName {
  const v = slug(value);
  const hit =
    CATEGORIES.find((c) => slug(c.name) === v) ??
    CATEGORIES.find((c) => v && (slug(c.name).includes(v) || v.includes(slug(c.name))));
  return (hit ?? CATEGORIES[0]).name;
}

function matchMount(value: string): Mount {
  const v = slug(value);
  return (MOUNTS.find((m) => slug(m) === v) ?? MOUNTS.find((m) => m && v.includes(slug(m))) ?? "") as Mount;
}

function matchTags(value: string): TagName[] {
  return value
    .split(/[;,|]/)
    .map((t) => slug(t))
    .filter(Boolean)
    .map((t) => TAGS.find((tag) => slug(tag) === t || slug(tag).includes(t)))
    .filter((t): t is TagName => !!t);
}

export function parseSheet(text: string): SheetResult {
  const delim = text.includes("\t") ? "\t" : ",";
  const rows = grid(text, delim);
  if (rows.length < 2) return { items: [], rows: 0, copies: 0, unknown: [], ok: false };

  const header = rows[0].map((h) => HEADERS[key(h)] ?? "");
  const unknown = rows[0].filter((h, n) => h && !header[n]);
  if (!header.includes("name") && !header.includes("num"))
    return { items: [], rows: rows.length - 1, copies: 0, unknown, ok: false };

  const cell = (r: string[], field: string) => {
    const at = header.indexOf(field);
    return at >= 0 ? (r[at] ?? "") : "";
  };

  const byEntry = new Map<string, GearItem>();
  let copies = 0;

  for (const r of rows.slice(1)) {
    const name = cell(r, "name") || cell(r, "num");
    if (!name) continue;
    const brand = cell(r, "brand");
    const model = cell(r, "model");
    const tag = cell(r, "num") || `${slug(name)}-${copies + 1}`;
    const groupKey = slug(`${name}${brand}${model}`);
    const baseNum = tag.replace(/[a-z]$/i, "") || tag;

    if (!byEntry.has(groupKey)) {
      byEntry.set(groupKey, {
        id: `i-${slug(baseNum) || groupKey}`,
        num: baseNum,
        name,
        brand,
        model,
        category: matchCategory(cell(r, "category")),
        mount: matchMount(cell(r, "mount")),
        size: cell(r, "size"),
        season: match<SeasonKey>(cell(r, "season"), SEASONS, "any"),
        desc: cell(r, "desc"),
        care: cell(r, "care"),
        returnInfo: cell(r, "returnInfo"),
        requiresTraining: yes(cell(r, "requiresTraining")),
        manualUrl: cell(r, "manualUrl"),
        listingUrl: cell(r, "listingUrl"),
        replacement: num(cell(r, "replacement")),
        weight: num(cell(r, "weight")),
        weightUnit: (WEIGHT_UNITS.find((u) => u === slug(cell(r, "weightUnit"))) ?? "lb") as WeightUnit,
        width: num(cell(r, "width")),
        height: num(cell(r, "height")),
        depth: num(cell(r, "depth")),
        dimUnit: (DIM_UNITS.find((u) => u === slug(cell(r, "dimUnit"))) ?? "in") as DimUnit,
        tags: matchTags(cell(r, "tags")),
        loanDays: num(cell(r, "loanDays")) || null,
        photo: cell(r, "photo") || undefined,
        copies: [],
      });
    }

    const entry = byEntry.get(groupKey)!;
    const copy: Copy = {
      id: `c-${slug(tag) || `${groupKey}${entry.copies.length}`}`,
      tag,
      condition: match<ConditionKey>(cell(r, "condition"), CONDITIONS, "light"),
      status: match<CopyStatus>(cell(r, "status"), COPY_STATUSES, "circulating"),
      acquired: cell(r, "acquired"),
      price: num(cell(r, "price")),
      source: cell(r, "source"),
      note: cell(r, "note"),
    };
    if (!entry.copies.some((c) => slug(c.tag) === slug(copy.tag))) {
      entry.copies.push(copy);
      copies++;
    }
  }

  return { items: [...byEntry.values()], rows: rows.length - 1, copies, unknown, ok: true };
}