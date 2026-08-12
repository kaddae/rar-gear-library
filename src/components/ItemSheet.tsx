import { Check, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StateBadge from "@/components/StateBadge";
import { useLibrary, shelfCopies, outCopies, itemState } from "@/store";
import {
  categoryTint,
  conditionLabel,
  dimsText,
  seasonLabel,
  seasonRange,
  weightText,
  type Copy,
  type GearItem,
} from "@/data/seed";
import { wall, copyWords, states } from "@/content/copy";

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1.5">
      <dt className="text-xs font-bold tracking-wide uppercase text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function ItemSheet({
  item,
  onOpenChange,
}: {
  item: GearItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const loans = useLibrary((s) => s.loans);
  const stories = useLibrary((s) => s.stories);
  const kitIds = useLibrary((s) => s.kit);
  const toggleKit = useLibrary((s) => s.toggleKit);

  if (!item) return null;

  const state = itemState(item, loans);
  const onShelf = shelfCopies(item, loans);
  const out = outCopies(item, loans);
  const repair = item.copies.filter((c) => c.status === "repair");
  const missing = item.copies.filter((c) => c.status === "missing");
  const canRequest = state === "available" || state === "out";
  const inKit = kitIds.includes(item.id);
  const trips = stories
    .filter((s) => !s.hidden && s.itemIds.includes(item.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const dueFor = (copy: Copy) => {
    const loan = loans.find(
      (l) => l.status === "open" && l.items.some((i) => i.copyId === copy.id && !i.returnedAt),
    );
    return loan ? format(new Date(loan.due), "MMM d") : "";
  };

  const specs = [
    item.size && { label: copyWords.sizeLabel, value: item.size },
    item.season !== "any" && {
      label: copyWords.seasonLabel,
      value: `${seasonLabel(item.season)} — ${seasonRange(item.season)}`,
    },
    item.mount && { label: "Mounts at", value: item.mount },
    weightText(item) && { label: copyWords.weightLabel, value: weightText(item) },
    dimsText(item) && { label: copyWords.dimsLabel, value: dimsText(item) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest text-muted-foreground">{item.num}</span>
            <span
              className="ink px-2 py-0.5 text-xs font-bold"
              style={{ background: categoryTint(item.category) }}
            >
              {item.category}
            </span>
          </div>
          <DialogTitle className="display text-2xl">{item.name}</DialogTitle>
          <DialogDescription>
            {[item.brand, item.model].filter(Boolean).join(" · ") || "Shop-built"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {item.photo ? (
            <img src={item.photo} alt={item.name} className="ink w-full max-h-56 object-cover" />
          ) : (
            <div className="photo-slot p-6 text-center">
              <p className="display text-sm">{wall.photoSlot}</p>
              <p className="text-xs text-muted-foreground mt-1">{wall.photoHint}</p>
            </div>
          )}

          <p>{item.desc}</p>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {specs.length > 0 && (
            <dl className="ink bg-card px-3 py-1 divide-y-2 divide-border">
              {specs.map((s) => (
                <Spec key={s.label} label={s.label}>
                  {s.value}
                </Spec>
              ))}
            </dl>
          )}

          {/* which physical ones exist, and where they are */}
          <div className="ink bg-background">
            <p className="display text-sm px-3 pt-2">{copyWords.which}</p>
            <ul className="px-3 pb-2 pt-1 space-y-1.5">
              {onShelf.map((c) => (
                <li key={c.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold tracking-widest">{c.tag}</span>
                  <span className="text-muted-foreground">{conditionLabel(c.condition)}</span>
                  <span className="ml-auto text-xs font-bold">{wall.onShelf}</span>
                  {c.note && <span className="w-full text-xs text-muted-foreground">{c.note}</span>}
                </li>
              ))}
              {out.map((c) => (
                <li key={c.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold tracking-widest">{c.tag}</span>
                  <span className="text-muted-foreground">{conditionLabel(c.condition)}</span>
                  <span className="ml-auto text-xs font-bold flex items-center gap-1">
                    <span className="out-dot" aria-hidden />
                    {dueFor(c) ? `back ${dueFor(c)}` : wall.outLabel}
                  </span>
                </li>
              ))}
              {repair.map((c) => (
                <li key={c.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold tracking-widest">{c.tag}</span>
                  <span className="ml-auto text-xs font-bold">{states.repair.tag}</span>
                  <span className="w-full text-xs text-muted-foreground">
                    {c.note || wall.repairNote}
                  </span>
                </li>
              ))}
              {missing.map((c) => (
                <li key={c.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold tracking-widest">{c.tag}</span>
                  <span className="ml-auto text-xs font-bold">{states.missing.tag}</span>
                  <span className="w-full text-xs text-muted-foreground">
                    {c.note || wall.lostAsk}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {missing.length > 0 && <p className="ink bg-muted p-3 text-sm">{wall.lostAsk}</p>}
          {item.requiresTraining && (
            <p className="ink bg-accent p-3 text-sm font-bold">{copyWords.training}</p>
          )}

          {item.care && (
            <div className="ink bg-muted p-3">
              <p className="display text-sm mb-1">{copyWords.careLabel}</p>
              <p className="text-sm">{item.care}</p>
            </div>
          )}
          {item.returnInfo && (
            <div className="ink bg-muted p-3">
              <p className="display text-sm mb-1">{copyWords.returnLabel}</p>
              <p className="text-sm">{item.returnInfo}</p>
            </div>
          )}

          {(item.manualUrl || item.listingUrl) && (
            <p className="text-sm flex flex-wrap gap-x-4">
              {item.manualUrl && (
                <a className="font-bold underline" href={item.manualUrl} target="_blank" rel="noreferrer">
                  {copyWords.manual}
                </a>
              )}
              {item.listingUrl && (
                <a className="font-bold underline" href={item.listingUrl} target="_blank" rel="noreferrer">
                  {copyWords.listing}
                </a>
              )}
            </p>
          )}

          {trips.length > 0 && (
            <div>
              <p className="display text-sm mb-2">{wall.storiesHeading}</p>
              <ul className="space-y-2">
                {trips.map((s) => (
                  <li key={s.id} className="ink bg-card p-3">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="display text-sm">{s.firstName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(s.createdAt), "MMM yyyy")}
                      </span>
                    </div>
                    <p className="text-sm">{s.text}</p>
                    {s.photo && <img src={s.photo} alt="" className="ink mt-2 max-h-36 object-cover" />}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          {canRequest ? (
            <Button
              size="lg"
              variant={inKit ? "secondary" : "default"}
              onClick={() => toggleKit(item.id)}
              className="w-full"
            >
              {inKit ? (
                <>
                  <Check className="w-4 h-4 mr-2" aria-hidden /> In your kit — tap to remove
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" aria-hidden /> Add to my kit
                </>
              )}
            </Button>
          ) : (
            <p className="w-full ink bg-muted px-3 py-2 text-sm font-bold text-center">
              {wall.cantRequest}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}