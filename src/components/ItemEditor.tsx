import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import PhotoField from "@/components/PhotoField";
import { useLibrary, nextTag } from "@/store";
import {
  CATEGORIES,
  CONDITIONS,
  COPY_STATUSES,
  DIM_UNITS,
  MOUNTS,
  SEASONS,
  TAGS,
  WEIGHT_UNITS,
  seasonRange,
  type Copy,
  type GearItem,
  type TagName,
} from "@/data/seed";
import { copyWords } from "@/content/copy";

const uid = () => Math.random().toString(36).slice(2, 10);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const blankItem = (): GearItem => ({
  id: "",
  num: "",
  name: "",
  brand: "",
  model: "",
  category: CATEGORIES[0].name,
  mount: "",
  size: "",
  season: "any",
  desc: "",
  care: "",
  returnInfo: "",
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
  copies: [],
});

function Field({
  label,
  htmlFor,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ItemEditor({ item, onClose }: { item: GearItem; onClose: () => void }) {
  const saveItem = useLibrary((s) => s.saveItem);
  const [d, setD] = useState<GearItem>(item);

  const set = <K extends keyof GearItem>(k: K, v: GearItem[K]) => setD((x) => ({ ...x, [k]: v }));
  const setCopy = (id: string, patch: Partial<Copy>) =>
    setD((x) => ({
      ...x,
      copies: x.copies.map((c) => (c.id === id ? { ...c, ...patch, id: c.id } : c)),
    }));

  function addCopy() {
    setD((x) => ({
      ...x,
      copies: [
        ...x.copies,
        {
          id: `c-${uid()}`,
          tag: nextTag(x),
          condition: "light",
          status: "circulating",
          acquired: "",
          price: 0,
          source: "",
          note: "",
        },
      ],
    }));
  }

  const ready = d.num.trim() && d.name.trim() && d.copies.length > 0;

  function save() {
    if (!ready) return;
    saveItem({
      ...d,
      id: d.id || `i-${slug(d.num) || uid()}`,
      num: d.num.trim(),
      name: d.name.trim(),
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="display text-2xl">
            {item.id ? `Edit ${item.num}` : "Add an item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Number" htmlFor="num" hint="The prefix on the stickers — BP-01">
              <Input id="num" value={d.num} onChange={(e) => set("num", e.target.value)} />
            </Field>
            <Field label="Item name" htmlFor="name">
              <Input id="name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Brand" htmlFor="brand">
              <Input id="brand" value={d.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Model" htmlFor="model">
              <Input id="model" value={d.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Category" htmlFor="category">
              <Select
                id="category"
                value={d.category}
                onChange={(e) => set("category", e.target.value as GearItem["category"])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mounts at" htmlFor="mount">
              <Select
                id="mount"
                value={d.mount}
                onChange={(e) => set("mount", e.target.value as GearItem["mount"])}
              >
                {MOUNTS.map((m) => (
                  <option key={m || "none"} value={m}>
                    {m || "—"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={copyWords.sizeLabel}
              htmlFor="size"
              hint="Fits 54–56cm frames · 20°F · 40L the pair"
            >
              <Input id="size" value={d.size} onChange={(e) => set("size", e.target.value)} />
            </Field>
            <Field label={copyWords.seasonLabel} htmlFor="season" hint={seasonRange(d.season)}>
              <Select
                id="season"
                value={d.season}
                onChange={(e) => set("season", e.target.value as GearItem["season"])}
              >
                {SEASONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Description" htmlFor="desc" hint="What it's for, and what comes with it.">
            <Textarea id="desc" rows={3} value={d.desc} onChange={(e) => set("desc", e.target.value)} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={copyWords.careLabel} htmlFor="care">
              <Textarea id="care" rows={2} value={d.care} onChange={(e) => set("care", e.target.value)} />
            </Field>
            <Field label={copyWords.returnLabel} htmlFor="returnInfo">
              <Textarea
                id="returnInfo"
                rows={2}
                value={d.returnInfo}
                onChange={(e) => set("returnInfo", e.target.value)}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="display text-sm mb-2">Tags</legend>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const on = d.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set(
                        "tags",
                        (on ? d.tags.filter((t) => t !== tag) : [...d.tags, tag]) as TagName[],
                      )
                    }
                    className={`ink px-3 min-h-11 text-sm font-bold ${
                      on ? "bg-foreground text-background" : "bg-card"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={copyWords.weightLabel} htmlFor="weight">
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  min={0}
                  step="0.1"
                  value={d.weight || ""}
                  onChange={(e) => set("weight", Number(e.target.value))}
                />
                <Select
                  aria-label="Weight unit"
                  className="w-24 shrink-0"
                  value={d.weightUnit}
                  onChange={(e) => set("weightUnit", e.target.value as GearItem["weightUnit"])}
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field label={copyWords.dimsLabel} hint="Width × height × depth">
              <div className="flex gap-2">
                {(["width", "height", "depth"] as const).map((k) => (
                  <Input
                    key={k}
                    type="number"
                    min={0}
                    aria-label={k}
                    placeholder={k[0].toUpperCase()}
                    value={d[k] || ""}
                    onChange={(e) => set(k, Number(e.target.value))}
                  />
                ))}
                <Select
                  aria-label="Dimension unit"
                  className="w-20 shrink-0"
                  value={d.dimUnit}
                  onChange={(e) => set("dimUnit", e.target.value as GearItem["dimUnit"])}
                >
                  {DIM_UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field label="Replacement cost" htmlFor="replacement" hint="What it costs us to replace.">
              <Input
                id="replacement"
                type="number"
                min={0}
                value={d.replacement || ""}
                onChange={(e) => set("replacement", Number(e.target.value))}
              />
            </Field>
            <Field label="Loan length" htmlFor="loanDays" hint="Days. Blank uses the 14-day default.">
              <Input
                id="loanDays"
                type="number"
                min={1}
                placeholder="14"
                value={d.loanDays ?? ""}
                onChange={(e) => set("loanDays", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label={copyWords.manual} htmlFor="manualUrl">
              <Input
                id="manualUrl"
                value={d.manualUrl}
                onChange={(e) => set("manualUrl", e.target.value)}
              />
            </Field>
            <Field label={copyWords.listing} htmlFor="listingUrl">
              <Input
                id="listingUrl"
                value={d.listingUrl}
                onChange={(e) => set("listingUrl", e.target.value)}
              />
            </Field>
          </div>

          <label className="ink bg-muted p-3 flex items-center gap-3 cursor-pointer">
            <Switch
              checked={d.requiresTraining}
              onCheckedChange={(v: boolean) => set("requiresTraining", v)}
              aria-label={copyWords.training}
            />
            <span className="text-sm font-bold">{copyWords.training}</span>
          </label>

          <PhotoField value={d.photo} onChange={(v) => set("photo", v)} label="Add a photo" />

          {/* the physical things */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="display text-lg">{copyWords.which}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCopy}>
                <Plus className="w-4 h-4 mr-2" aria-hidden />
                {copyWords.addCopy}
              </Button>
            </div>
            {d.copies.length === 0 && (
              <p className="ink bg-muted p-3 text-sm">
                Nothing physical yet — add at least one, with the number on its sticker.
              </p>
            )}
            <ul className="space-y-3">
              {d.copies.map((c) => (
                <li key={c.id} className="ink bg-card p-3 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label={copyWords.tagLabel}>
                      <Input
                        aria-label="Sticker number"
                        value={c.tag}
                        onChange={(e) => setCopy(c.id, { tag: e.target.value })}
                      />
                    </Field>
                    <Field label="Condition">
                      <Select
                        aria-label="Condition"
                        value={c.condition}
                        onChange={(e) => setCopy(c.id, { condition: e.target.value as Copy["condition"] })}
                      >
                        {CONDITIONS.map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Status">
                      <Select
                        aria-label="Status"
                        value={c.status}
                        onChange={(e) => setCopy(c.id, { status: e.target.value as Copy["status"] })}
                      >
                        {COPY_STATUSES.map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label={copyWords.acquired}>
                      <Input
                        type="date"
                        aria-label="Date acquired"
                        value={c.acquired}
                        onChange={(e) => setCopy(c.id, { acquired: e.target.value })}
                      />
                    </Field>
                    <Field label={copyWords.price}>
                      <Input
                        type="number"
                        min={0}
                        aria-label="Purchase price"
                        value={c.price || ""}
                        onChange={(e) => setCopy(c.id, { price: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label={copyWords.source}>
                      <Input
                        aria-label="Where it came from"
                        value={c.source}
                        onChange={(e) => setCopy(c.id, { source: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label={copyWords.noteLabel}>
                    <Input
                      aria-label="This copy's quirk"
                      placeholder="zipper sticks · left pole taped"
                      value={c.note}
                      onChange={(e) => setCopy(c.id, { note: e.target.value })}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setD((x) => ({ ...x, copies: x.copies.filter((y) => y.id !== c.id) }))
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden />
                    {copyWords.removeCopy}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!ready}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}