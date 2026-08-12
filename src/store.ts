import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_ITEMS,
  SEED_HOLDS,
  SEED_LOANS,
  SEED_STORIES,
  type GearItem,
  type Hold,
  type Loan,
  type Story,
} from "@/data/seed";
import type { ConditionKey, Copy, CopyStatus } from "@/lib/schema";
import { LOAN_DAYS } from "@/content/copy";

export type Persona = "borrower" | "crew";
export type ItemState = "available" | "out" | "repair" | "missing" | "retired";

const uid = () => Math.random().toString(36).slice(2, 10);
const DAY = 86400000;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/* ---------------------------------------------------------------- derived
 * "Out" is never stored. It is read from open loans every time, so the wall
 * cannot drift from what is actually hanging on the pegboard.
 * ------------------------------------------------------------------------ */

export function outCopyIds(loans: Loan[]): Set<string> {
  const out = new Set<string>();
  for (const l of loans) {
    if (l.status !== "open") continue;
    for (const i of l.items) if (!i.returnedAt) out.add(i.copyId);
  }
  return out;
}

export function copyState(copy: Copy, out: Set<string>): ItemState {
  if (copy.status === "retired") return "retired";
  if (copy.status === "repair") return "repair";
  if (copy.status === "missing") return "missing";
  return out.has(copy.id) ? "out" : "available";
}

/** copies a neighbor could walk out with today */
export function shelfCopies(item: GearItem, loans: Loan[]): Copy[] {
  const out = outCopyIds(loans);
  return item.copies.filter((c) => c.status === "circulating" && !out.has(c.id));
}

export function outCopies(item: GearItem, loans: Loan[]): Copy[] {
  const out = outCopyIds(loans);
  return item.copies.filter((c) => c.status === "circulating" && out.has(c.id));
}

/** in the stand or gone */
export function downCopies(item: GearItem): Copy[] {
  return item.copies.filter((c) => c.status === "repair" || c.status === "missing");
}

export function liveCopies(item: GearItem): Copy[] {
  return item.copies.filter((c) => c.status !== "retired");
}

export function itemState(item: GearItem, loans: Loan[]): ItemState {
  if (liveCopies(item).length === 0) return "retired";
  if (shelfCopies(item, loans).length > 0) return "available";
  if (outCopies(item, loans).length > 0) return "out";
  if (item.copies.some((c) => c.status === "repair")) return "repair";
  return "missing";
}

export function findCopy(items: GearItem[], copyId: string) {
  for (const item of items) {
    const copy = item.copies.find((c) => c.id === copyId);
    if (copy) return { item, copy };
  }
  return null;
}

export function pendingFor(holds: Hold[], itemId: string) {
  return holds.filter((h) => h.status === "pending" && h.itemIds.includes(itemId)).length;
}

/** shortest override wins — a 3-day repair kit doesn't ride along on a 14-day tent */
export function loanDaysFor(items: GearItem[], itemIds: string[]) {
  const days = itemIds
    .map((id) => items.find((i) => i.id === id)?.loanDays)
    .filter((d): d is number => typeof d === "number" && d > 0);
  return days.length ? Math.min(...days) : LOAN_DAYS;
}

export function nextTag(item: GearItem) {
  const used = new Set(item.copies.map((c) => c.tag.toLowerCase()));
  for (const l of LETTERS) {
    const tag = `${item.num}${l}`;
    if (!used.has(tag.toLowerCase())) return tag;
  }
  return `${item.num}-${item.copies.length + 1}`;
}

type Store = {
  items: GearItem[];
  holds: Hold[];
  loans: Loan[];
  stories: Story[];
  kit: string[];
  persona: Persona;
  setPersona: (p: Persona) => void;
  toggleKit: (itemId: string) => void;
  clearKit: () => void;
  submitRequest: (r: Omit<Hold, "id" | "itemIds" | "status" | "createdAt">) => void;
  cancelHold: (id: string) => void;
  dropFromHold: (holdId: string, itemId: string) => void;
  /** picks: itemId -> copyId chosen at the counter; anything unpicked takes the first free copy */
  checkOut: (holdId: string, picks?: Record<string, string>) => void;
  returnCopy: (loanId: string, copyId: string) => void;
  addStory: (s: Omit<Story, "id" | "hidden" | "createdAt">) => void;
  toggleStoryHidden: (id: string) => void;
  saveItem: (item: GearItem) => void;
  setCopyStatus: (copyId: string, status: CopyStatus) => void;
  setCopyCondition: (copyId: string, condition: ConditionKey) => void;
  updateCopy: (copyId: string, patch: Partial<Copy>) => void;
  addCopy: (itemId: string) => void;
  removeCopy: (copyId: string) => void;
  importItems: (rows: GearItem[]) => void;
};

const patchCopy = (items: GearItem[], copyId: string, patch: Partial<Copy>) =>
  items.map((i) =>
    i.copies.some((c) => c.id === copyId)
      ? { ...i, copies: i.copies.map((c) => (c.id === copyId ? { ...c, ...patch, id: c.id } : c)) }
      : i,
  );

export const useLibrary = create<Store>()(
  persist(
    (set) => ({
      items: SEED_ITEMS,
      holds: SEED_HOLDS,
      loans: SEED_LOANS,
      stories: SEED_STORIES,
      kit: [],
      persona: "borrower",

      setPersona: (persona) => set({ persona }),

      toggleKit: (itemId) =>
        set((s) => ({
          kit: s.kit.includes(itemId) ? s.kit.filter((k) => k !== itemId) : [...s.kit, itemId],
        })),

      clearKit: () => set({ kit: [] }),

      submitRequest: (r) =>
        set((s) => ({
          holds: [
            {
              ...r,
              id: uid(),
              itemIds: s.kit,
              status: "pending" as const,
              createdAt: new Date().toISOString(),
            },
            ...s.holds,
          ],
          kit: [],
        })),

      cancelHold: (id) =>
        set((s) => ({
          holds: s.holds.map((h) => (h.id === id ? { ...h, status: "cancelled" as const } : h)),
        })),

      dropFromHold: (holdId, itemId) =>
        set((s) => ({
          holds: s.holds.map((h) =>
            h.id === holdId ? { ...h, itemIds: h.itemIds.filter((i) => i !== itemId) } : h,
          ),
        })),

      checkOut: (holdId, picks = {}) =>
        set((s) => {
          const hold = s.holds.find((h) => h.id === holdId);
          if (!hold || hold.itemIds.length === 0) return s;

          const taken = outCopyIds(s.loans);
          const chosen: { copyId: string }[] = [];
          for (const itemId of hold.itemIds) {
            const item = s.items.find((i) => i.id === itemId);
            if (!item) continue;
            const picked = picks[itemId]
              ? item.copies.find((c) => c.id === picks[itemId] && !taken.has(c.id))
              : undefined;
            const copy =
              picked ?? item.copies.find((c) => c.status === "circulating" && !taken.has(c.id));
            if (!copy) continue;
            taken.add(copy.id);
            chosen.push({ copyId: copy.id });
          }
          if (chosen.length === 0) return s;

          const loan: Loan = {
            id: uid(),
            holdId,
            borrowerName: hold.name,
            borrowerEmail: hold.email,
            out: new Date().toISOString(),
            due: new Date(Date.now() + loanDaysFor(s.items, hold.itemIds) * DAY).toISOString(),
            status: "open",
            token: uid() + uid(),
            items: chosen.map((c) => ({ copyId: c.copyId, returnedAt: null })),
          };
          return {
            loans: [loan, ...s.loans],
            holds: s.holds.map((h) =>
              h.id === holdId ? { ...h, status: "fulfilled" as const } : h,
            ),
          };
        }),

      returnCopy: (loanId, copyId) =>
        set((s) => ({
          loans: s.loans.map((l) => {
            if (l.id !== loanId) return l;
            const items = l.items.map((i) =>
              i.copyId === copyId && !i.returnedAt
                ? { ...i, returnedAt: new Date().toISOString() }
                : i,
            );
            return {
              ...l,
              items,
              status: items.every((i) => i.returnedAt) ? ("closed" as const) : l.status,
            };
          }),
        })),

      addStory: (s0) =>
        set((s) => ({
          stories: [
            { ...s0, id: uid(), hidden: false, createdAt: new Date().toISOString() },
            ...s.stories,
          ],
        })),

      toggleStoryHidden: (id) =>
        set((s) => ({
          stories: s.stories.map((st) => (st.id === id ? { ...st, hidden: !st.hidden } : st)),
        })),

      saveItem: (item) =>
        set((s) => ({
          items: s.items.some((i) => i.id === item.id)
            ? s.items.map((i) => (i.id === item.id ? item : i))
            : [...s.items, item],
        })),

      setCopyStatus: (copyId, status) => set((s) => ({ items: patchCopy(s.items, copyId, { status }) })),

      setCopyCondition: (copyId, condition) =>
        set((s) => ({ items: patchCopy(s.items, copyId, { condition }) })),

      updateCopy: (copyId, patch) => set((s) => ({ items: patchCopy(s.items, copyId, patch) })),

      addCopy: (itemId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  copies: [
                    ...i.copies,
                    {
                      id: `c-${uid()}`,
                      tag: nextTag(i),
                      condition: "light" as ConditionKey,
                      status: "circulating" as CopyStatus,
                      acquired: "",
                      price: 0,
                      source: "",
                      note: "",
                    },
                  ],
                }
              : i,
          ),
        })),

      removeCopy: (copyId) =>
        set((s) => ({
          items: s.items.map((i) => ({ ...i, copies: i.copies.filter((c) => c.id !== copyId) })),
        })),

      importItems: (rows) =>
        set((s) => {
          const next = [...s.items];
          for (const row of rows) {
            const at = next.findIndex((i) => i.num.toLowerCase() === row.num.toLowerCase());
            if (at < 0) {
              next.push(row);
              continue;
            }
            const cur = next[at];
            const copies = [...cur.copies];
            for (const c of row.copies) {
              const ci = copies.findIndex((x) => x.tag.toLowerCase() === c.tag.toLowerCase());
              // a re-import refreshes the words; it never overwrites what crew set by hand
              if (ci >= 0) copies[ci] = { ...copies[ci], ...c, id: copies[ci].id, status: copies[ci].status };
              else copies.push(c);
            }
            next[at] = { ...cur, ...row, id: cur.id, photo: row.photo || cur.photo, copies };
          }
          return { items: next };
        }),
    }),
    {
      name: "bradley-gear-library",
      version: 3,
      migrate: (state: any, from: number) => {
        // v3 moved condition and status onto individual copies; older saved
        // rows can't be mapped honestly, so the demo shelf comes back fresh.
        if (from < 3)
          return {
            ...state,
            items: SEED_ITEMS,
            holds: SEED_HOLDS,
            loans: SEED_LOANS,
            stories: SEED_STORIES,
            kit: [],
          };
        return state;
      },
    },
  ),
);