import { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { Check, Copy as CopyIcon, Eye, EyeOff, Inbox, Pencil, Plus, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import PhotoField from "@/components/PhotoField";
import StateBadge from "@/components/StateBadge";
import ItemEditor, { blankItem } from "@/components/ItemEditor";
import {
  useLibrary,
  outCopyIds,
  copyState,
  shelfCopies,
  outCopies,
  downCopies,
  liveCopies,
  itemState,
  findCopy,
  pendingFor,
  type ItemState,
} from "@/store";
import { parseSheet } from "@/lib/sheet";
import {
  CONDITIONS,
  COPY_STATUSES,
  conditionLabel,
  type Copy,
  type GearItem,
  type Loan,
} from "@/data/seed";
import { crew as t, emails, copyWords, states } from "@/content/copy";

const tripLink = (token: string) =>
  `${window.location.origin}${window.location.pathname}#/trip/${token}`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        } catch {
          window.prompt("Copy this:", text);
        }
      }}
    >
      <CopyIcon className="w-4 h-4 mr-2" aria-hidden />
      {done ? "Copied" : label}
    </Button>
  );
}

export default function Crew() {
  const items = useLibrary((s) => s.items);
  const holds = useLibrary((s) => s.holds);
  const loans = useLibrary((s) => s.loans);
  const stories = useLibrary((s) => s.stories);
  const cancelHold = useLibrary((s) => s.cancelHold);
  const dropFromHold = useLibrary((s) => s.dropFromHold);
  const checkOut = useLibrary((s) => s.checkOut);
  const returnCopy = useLibrary((s) => s.returnCopy);
  const addStory = useLibrary((s) => s.addStory);
  const toggleStoryHidden = useLibrary((s) => s.toggleStoryHidden);
  const setCopyStatus = useLibrary((s) => s.setCopyStatus);
  const setCopyCondition = useLibrary((s) => s.setCopyCondition);
  const addCopy = useLibrary((s) => s.addCopy);
  const importItems = useLibrary((s) => s.importItems);

  const [picks, setPicks] = useState<Record<string, Record<string, string>>>({});
  const [storyLoan, setStoryLoan] = useState<Loan | null>(null);
  const [storyText, setStoryText] = useState("");
  const [storyPhoto, setStoryPhoto] = useState<string | undefined>();
  const [draft, setDraft] = useState<GearItem | null>(null);
  const [sheet, setSheet] = useState("");
  const [filter, setFilter] = useState<ItemState | "all">("all");

  const waiting = holds.filter((h) => h.status === "pending");
  const open = loans.filter((l) => l.status === "open");
  const outIds = outCopyIds(loans);
  const parsed = sheet.trim() ? parseSheet(sheet) : null;
  const shown = filter === "all" ? items : items.filter((i) => itemState(i, loans) === filter);
  const copyTotal = items.reduce((n, i) => n + i.copies.length, 0);

  const pick = (holdId: string, itemId: string) => picks[holdId]?.[itemId] ?? "";
  const setPick = (holdId: string, itemId: string, copyId: string) =>
    setPicks((p) => ({ ...p, [holdId]: { ...(p[holdId] ?? {}), [itemId]: copyId } }));

  const dueFor = (copyId: string) => {
    const loan = loans.find(
      (l) => l.status === "open" && l.items.some((i) => i.copyId === copyId && !i.returnedAt),
    );
    return loan ? format(new Date(loan.due), "MMM d") : "";
  };

  function openStory(loan: Loan) {
    setStoryLoan(loan);
    setStoryText("");
    setStoryPhoto(undefined);
  }

  function saveStory() {
    if (!storyLoan || !storyText.trim()) return;
    addStory({
      loanId: storyLoan.id,
      firstName: storyLoan.borrowerName.split(" ")[0],
      itemIds: storyLoan.items
        .map((i) => findCopy(items, i.copyId)?.item.id)
        .filter((id): id is string => !!id),
      text: storyText.trim(),
      photo: storyPhoto,
    });
    setStoryLoan(null);
  }

  function checkIn(loan: Loan, copyId: string, needsWork = false) {
    if (needsWork) setCopyStatus(copyId, "repair");
    const left = loan.items.filter((i) => !i.returnedAt).length;
    returnCopy(loan.id, copyId);
    if (left === 1) openStory(loan);
  }

  return (
    <div>
      <h1 className="display text-3xl mb-5">{t.heading}</h1>

      <Tabs defaultValue="holds">
        <TabsList>
          <TabsTrigger value="holds">
            {t.holds} {waiting.length > 0 && `(${waiting.length})`}
          </TabsTrigger>
          <TabsTrigger value="out">
            {t.out} {open.length > 0 && `(${open.length})`}
          </TabsTrigger>
          <TabsTrigger value="shelf">{t.shelf}</TabsTrigger>
          <TabsTrigger value="trips">{t.trips}</TabsTrigger>
        </TabsList>

        {/* ---------------- waiting ---------------- */}
        <TabsContent value="holds">
          {waiting.length === 0 ? (
            <EmptyState icon={<Inbox />} title={t.noHolds} hint="Requests land here from the shelf." />
          ) : (
            <ul className="space-y-4">
              {waiting.map((h) => {
                const free = h.itemIds.map((id) => {
                  const item = items.find((i) => i.id === id);
                  return { id, item, copies: item ? shelfCopies(item, loans) : [] };
                });
                const handable = free.some((f) => f.copies.length > 0);
                return (
                  <li key={h.id} className="ink bg-card p-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                      <span className="display text-xl">{h.name}</span>
                      <Badge variant="outline">{h.group}</Badge>
                      <span className="text-sm text-muted-foreground ml-auto">
                        asked {format(new Date(h.createdAt), "MMM d")}
                      </span>
                    </div>
                    <p className="text-sm font-bold mb-1">Coming by: {h.shift || h.when}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {h.email}
                      {h.phone ? ` · ${h.phone}` : ""}
                    </p>

                    {h.note && (
                      <p className="ink bg-muted p-3 text-sm mb-3">
                        <span className="display text-sm block mb-1">They said</span>
                        {h.note}
                      </p>
                    )}

                    <ul className="ink divide-y-2 divide-border bg-background mb-3">
                      {free.map((f) => (
                        <li key={f.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                          <span className="font-bold tracking-widest text-muted-foreground">
                            {f.item?.num ?? f.id}
                          </span>
                          <span className="min-w-0 flex-1 basis-32 truncate">
                            {f.item?.name ?? "—"}
                          </span>
                          {f.copies.length > 0 ? (
                            <Select
                              aria-label={`Which ${f.item?.name ?? "one"} goes out`}
                              className="w-44 shrink-0"
                              value={pick(h.id, f.id)}
                              onChange={(e) => setPick(h.id, f.id, e.target.value)}
                            >
                              <option value="">First free one</option>
                              {f.copies.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.tag} — {conditionLabel(c.condition)}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <span className="ink bg-destructive text-destructive-foreground px-1.5 text-xs font-bold">
                              none on shelf
                            </span>
                          )}
                          <button
                            onClick={() => dropFromHold(h.id, f.id)}
                            className="text-xs font-bold underline min-h-11 px-1"
                          >
                            drop
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => checkOut(h.id, picks[h.id])} disabled={!handable}>
                        Hand it over
                      </Button>
                      <CopyButton
                        label="Copy confirmation"
                        text={emails.holdConfirmation({
                          name: h.name,
                          items: free.map((f) =>
                            f.item ? `${f.item.num} — ${f.item.name}` : f.id,
                          ),
                          when: h.shift || h.when,
                        })}
                      />
                      <Button variant="ghost" onClick={() => cancelHold(h.id)}>
                        Cancel
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        {/* ---------------- out ---------------- */}
        <TabsContent value="out">
          {open.length === 0 ? (
            <EmptyState icon={<Check />} title={t.noOut} hint="Everything is on the pegboard." />
          ) : (
            <ul className="space-y-4">
              {open.map((l) => {
                const days = differenceInCalendarDays(new Date(l.due), new Date());
                return (
                  <li key={l.id} className="ink bg-card p-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                      <span className="display text-xl">{l.borrowerName}</span>
                      {days < 0 ? (
                        <span className="ink bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-bold">
                          {Math.abs(days)} days over
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          due {format(new Date(l.due), "EEE MMM d")}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground ml-auto">
                        out {format(new Date(l.out), "MMM d")}
                      </span>
                    </div>

                    <ul className="ink divide-y-2 divide-border bg-background mb-3">
                      {l.items.map((li) => {
                        const found = findCopy(items, li.copyId);
                        return (
                          <li
                            key={li.copyId}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm"
                          >
                            <span className="font-bold tracking-widest text-muted-foreground">
                              {found?.copy.tag ?? li.copyId}
                            </span>
                            <span className="min-w-0 truncate">{found?.item.name ?? "—"}</span>
                            <span className="ml-auto shrink-0">
                              {li.returnedAt ? (
                                <span className="text-xs font-bold text-muted-foreground">
                                  back {format(new Date(li.returnedAt), "MMM d")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Button size="sm" onClick={() => checkIn(l, li.copyId)}>
                                    Checked in
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    title={t.needsWork}
                                    aria-label={`${t.needsWork}: ${found?.copy.tag ?? li.copyId}`}
                                    onClick={() => checkIn(l, li.copyId, true)}
                                  >
                                    <Wrench className="w-4 h-4" aria-hidden />
                                  </Button>
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openStory(l)}>
                        {t.storyPrompt}
                      </Button>
                      <CopyButton
                        label="Copy story nudge"
                        text={emails.storyNudge({ name: l.borrowerName, link: tripLink(l.token) })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        {/* ---------------- shelf ---------------- */}
        <TabsContent value="shelf">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Button onClick={() => setDraft(blankItem())}>
              <Plus className="w-4 h-4 mr-2" aria-hidden /> Add an item
            </Button>
            <span className="text-sm text-muted-foreground">
              {items.length} entries · {copyTotal} copies
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(["all", "available", "out", "repair", "missing", "retired"] as const).map((k) => {
              const n =
                k === "all" ? items.length : items.filter((i) => itemState(i, loans) === k).length;
              const on = filter === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  aria-pressed={on}
                  className={`ink px-3 min-h-11 text-sm font-bold flex items-center gap-2 ${
                    on ? "bg-foreground text-background" : "bg-card"
                  }`}
                >
                  {k === "all" ? t.everything : states[k].label}
                  <span className="opacity-60">{n}</span>
                </button>
              );
            })}
          </div>

          {shown.length === 0 && (
            <p className="ink bg-card px-3 py-4 text-sm text-muted-foreground mb-8">
              {t.nothingHere}
            </p>
          )}

          <ul className="space-y-3 mb-10">
            {shown.map((i) => {
              const waitingOn = pendingFor(holds, i.id);
              return (
                <li key={i.id} className="ink bg-card p-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
                    <span className="text-xs font-bold tracking-widest text-muted-foreground">
                      {i.num}
                    </span>
                    <span className="display text-lg">{i.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[i.brand, i.model].filter(Boolean).join(" ")}
                    </span>
                    <StateBadge state={itemState(i, loans)} className="ml-auto" />
                    <Button size="sm" variant="outline" onClick={() => setDraft(i)}>
                      <Pencil className="w-4 h-4 mr-2" aria-hidden />
                      Edit
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {shelfCopies(i, loans).length} on the shelf · {outCopies(i, loans).length} out ·{" "}
                    {downCopies(i).length} down · {liveCopies(i).length} in circulation
                    {waitingOn > 0 && ` · ${waitingOn} waiting`}
                  </p>

                  <ul className="ink divide-y-2 divide-border bg-background">
                    {i.copies.map((c) => {
                      const st = copyState(c, outIds);
                      return (
                        <li key={c.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                          <span className="text-xs font-bold tracking-widest w-16 shrink-0">
                            {c.tag}
                          </span>
                          <Select
                            aria-label={`Condition of ${c.tag}`}
                            className="w-40 shrink-0"
                            value={c.condition}
                            onChange={(e) =>
                              setCopyCondition(c.id, e.target.value as Copy["condition"])
                            }
                          >
                            {CONDITIONS.map((o) => (
                              <option key={o.key} value={o.key}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                          <Select
                            aria-label={`Status of ${c.tag}`}
                            className="w-40 shrink-0"
                            value={c.status}
                            onChange={(e) => setCopyStatus(c.id, e.target.value as Copy["status"])}
                          >
                            {COPY_STATUSES.map((o) => (
                              <option key={o.key} value={o.key}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                          {st === "out" ? (
                            <span className="text-xs font-bold flex items-center gap-1">
                              <span className="out-dot" aria-hidden />
                              back {dueFor(c.id) || "—"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{states[st].tag}</span>
                          )}
                          {c.note && (
                            <span className="w-full text-xs text-muted-foreground">{c.note}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => addCopy(i.id)}>
                    <Plus className="w-4 h-4 mr-2" aria-hidden />
                    {copyWords.addCopy}
                  </Button>
                </li>
              );
            })}
          </ul>

          {/* paste from a spreadsheet */}
          <div className="ink bg-card p-4">
            <h2 className="display text-xl mb-1">{t.paste}</h2>
            <p className="text-sm text-muted-foreground mb-3">{t.pasteHint}</p>
            <Textarea
              rows={6}
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              aria-label={t.paste}
              placeholder="Number	Item Name	Brand	Condition	Size	Categories…"
            />
            {parsed && (
              <div className="mt-3 space-y-2">
                {!parsed.ok ? (
                  <p className="text-sm font-bold text-destructive">{t.pasteMissing}</p>
                ) : (
                  <>
                    <p className="text-sm font-bold">
                      {t.pasteReading(parsed.rows, parsed.copies, parsed.items.length)}
                    </p>
                    {parsed.unknown.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t.pasteUnknown(parsed.unknown)}
                      </p>
                    )}
                    <ul className="ink divide-y-2 divide-border bg-background max-h-56 overflow-y-auto">
                      {parsed.items.map((i) => (
                        <li key={i.id} className="px-3 py-1.5 text-sm flex flex-wrap gap-x-2">
                          <span className="font-bold tracking-widest text-muted-foreground">
                            {i.num}
                          </span>
                          <span className="min-w-0 truncate">{i.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {i.copies.map((c) => c.tag).join(", ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          importItems(parsed.items);
                          setSheet("");
                        }}
                      >
                        {t.commit}
                      </Button>
                      <Button variant="ghost" onClick={() => setSheet("")}>
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---------------- trips ---------------- */}
        <TabsContent value="trips">
          {stories.length === 0 ? (
            <EmptyState icon={<Inbox />} title={t.noTrips} hint={t.storyHint} />
          ) : (
            <ul className="space-y-3">
              {stories.map((s) => (
                <li key={s.id} className="ink bg-card p-4">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="display text-lg">{s.firstName}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(s.createdAt), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.itemIds
                        .map((id) => items.find((i) => i.id === id)?.num)
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => toggleStoryHidden(s.id)}
                    >
                      {s.hidden ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" aria-hidden /> Put it back up
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" aria-hidden /> Take it down
                        </>
                      )}
                    </Button>
                  </div>
                  <p className={`text-sm ${s.hidden ? "opacity-50" : ""}`}>{s.text}</p>
                  {s.photo && (
                    <img src={s.photo} alt="" className="ink mt-2 max-h-40 object-cover" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* story taken at the counter */}
      <Dialog open={!!storyLoan} onOpenChange={(o) => !o && setStoryLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="display text-2xl">{t.storyPrompt}</DialogTitle>
            <DialogDescription>{t.storyHint}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="story">
                {storyLoan ? `${storyLoan.borrowerName.split(" ")[0]}'s trip` : "Their trip"}
              </Label>
              <Textarea
                id="story"
                rows={4}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Where they went, what surprised them…"
              />
            </div>
            <PhotoField value={storyPhoto} onChange={setStoryPhoto} label="Add their photo" />
            <p className="ink bg-muted p-3 text-sm">{t.consent}</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStoryLoan(null)}>
              {t.skip}
            </Button>
            <Button onClick={saveStory} disabled={!storyText.trim()}>
              Add it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {draft && <ItemEditor key={draft.id || "new"} item={draft} onClose={() => setDraft(null)} />}
    </div>
  );
}