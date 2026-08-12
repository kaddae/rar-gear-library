import { useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import ItemSheet from "@/components/ItemSheet";
import StateBadge from "@/components/StateBadge";
import { useLibrary, shelfCopies, outCopies, liveCopies, itemState } from "@/store";
import { CATEGORIES, TAGS, type CategoryName, type GearItem } from "@/data/seed";
import { wall, impact, states } from "@/content/copy";

const FIRST_TRIP = TAGS[0];

export default function Wall() {
  const items = useLibrary((s) => s.items);
  const loans = useLibrary((s) => s.loans);
  const stories = useLibrary((s) => s.stories);
  const kitIds = useLibrary((s) => s.kit);
  const toggleKit = useLibrary((s) => s.toggleKit);

  const [open, setOpen] = useState<GearItem | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryName | "all">("all");
  const [inOnly, setInOnly] = useState(false);
  const [firstTrip, setFirstTrip] = useState(false);

  const live = items.filter((i) => liveCopies(i).length > 0);
  const totalUnits = live.reduce((n, i) => n + liveCopies(i).length, 0);
  const onUnits = live.reduce((n, i) => n + shelfCopies(i, loans).length, 0);
  const people = new Set(loans.map((l) => l.borrowerEmail)).size;

  const needle = q.trim().toLowerCase();
  const filtering = needle.length > 0 || cat !== "all" || inOnly || firstTrip;

  const shown = live.filter((i) => {
    if (cat !== "all" && i.category !== cat) return false;
    if (inOnly && shelfCopies(i, loans).length === 0) return false;
    if (firstTrip && !i.tags.includes(FIRST_TRIP)) return false;
    if (!needle) return true;
    return [i.num, i.name, i.brand, i.model, i.size, i.mount, i.category, i.desc, ...i.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  function clearAll() {
    setQ("");
    setCat("all");
    setInOnly(false);
    setFirstTrip(false);
  }

  if (live.length === 0) {
    return <p className="display text-lg py-16 text-center">{wall.empty}</p>;
  }

  const chip = (active: boolean) =>
    `ink px-3 min-h-11 text-sm font-bold flex items-center gap-1.5 ${
      active ? "shadow-[3px_3px_0_var(--foreground)]" : "bg-card"
    }`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <p className="display text-lg sm:mr-auto">
          {filtering ? wall.showing(shown.length) : wall.counter(onUnits, totalUnits)}
        </p>
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={wall.search}
            aria-label={wall.search}
            className="pl-9 pr-11"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCat("all")}
          aria-pressed={cat === "all"}
          className={chip(cat === "all")}
          style={
            cat === "all" ? { background: "var(--foreground)", color: "var(--background)" } : undefined
          }
        >
          {wall.all}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setCat(cat === c.name ? "all" : c.name)}
            aria-pressed={cat === c.name}
            className={chip(cat === c.name)}
            style={cat === c.name ? { background: c.tint } : undefined}
          >
            {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setInOnly(!inOnly)}
          aria-pressed={inOnly}
          className={chip(inOnly)}
          style={inOnly ? { background: "var(--background)" } : undefined}
        >
          <span
            className="out-dot"
            style={{ background: inOnly ? "var(--foreground)" : "var(--destructive)" }}
            aria-hidden
          />
          {wall.inOnly}
        </button>
        <button
          type="button"
          onClick={() => setFirstTrip(!firstTrip)}
          aria-pressed={firstTrip}
          className={chip(firstTrip)}
          style={firstTrip ? { background: "var(--accent)" } : undefined}
        >
          {FIRST_TRIP}
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title={wall.noMatch}
          hint={wall.noMatchHint}
          action={
            <Button variant="outline" onClick={clearAll}>
              {wall.clear}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((c) => {
            const group = shown.filter((i) => i.category === c.name);
            if (group.length === 0) return null;
            return (
              <section key={c.name}>
                <h2
                  className="display text-lg sm:text-xl ink inline-block px-3 py-1 mb-3"
                  style={{ background: c.tint }}
                >
                  {c.name}
                </h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.map((item) => {
                    const state = itemState(item, loans);
                    const on = shelfCopies(item, loans).length;
                    const out = outCopies(item, loans).length;
                    const repair = item.copies.filter((x) => x.status === "repair").length;
                    const missing = item.copies.filter((x) => x.status === "missing").length;
                    const canRequest = state === "available" || state === "out";
                    const inKit = kitIds.includes(item.id);
                    return (
                      <li key={item.id} className="relative">
                        <button
                          onClick={() => setOpen(item)}
                          className="tag bg-card w-full h-full text-left p-3 min-h-[104px] flex flex-col gap-1"
                        >
                          <span className="text-[11px] font-bold tracking-widest text-muted-foreground pr-12">
                            {item.num}
                          </span>
                          <span className="display text-base leading-tight pr-12">{item.name}</span>
                          {item.size && (
                            <span className="text-xs text-muted-foreground leading-snug">
                              {item.size}
                            </span>
                          )}
                          {item.photo && (
                            <img
                              src={item.photo}
                              alt=""
                              className="ink mt-2 w-full h-24 object-cover"
                              loading="lazy"
                            />
                          )}
                          <span className="mt-auto pt-2 text-xs flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            {state === "available" ? (
                              <>
                                <span className="text-muted-foreground">
                                  {on} {wall.onShelf}
                                </span>
                                {out > 0 && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <span className="out-dot" aria-hidden />
                                    {out} {wall.outLabel}
                                  </span>
                                )}
                                {repair > 0 && (
                                  <span className="text-muted-foreground">
                                    · {repair} {states.repair.tag}
                                  </span>
                                )}
                                {missing > 0 && (
                                  <span className="text-muted-foreground">
                                    · {missing} {states.missing.tag}
                                  </span>
                                )}
                              </>
                            ) : (
                              <StateBadge state={state} />
                            )}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleKit(item.id)}
                          disabled={!canRequest}
                          title={canRequest ? undefined : wall.cantRequest}
                          aria-label={
                            inKit
                              ? `Take ${item.name} out of your kit`
                              : `Add ${item.name} to your kit`
                          }
                          aria-pressed={inKit}
                          className={`absolute top-2 right-2 h-11 w-11 ink flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed ${
                            inKit ? "bg-foreground text-background" : "bg-background"
                          }`}
                        >
                          {inKit ? (
                            <Check className="w-5 h-5" aria-hidden />
                          ) : (
                            <Plus className="w-5 h-5" aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        {impact({ loans: loans.length, people, trips: stories.filter((s) => !s.hidden).length })}
      </p>

      <ItemSheet item={open} onOpenChange={(o) => !o && setOpen(null)} />
    </div>
  );
}