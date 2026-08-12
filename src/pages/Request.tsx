import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useLibrary } from "@/store";
import { GROUPS, SHIFTS, SHOP, STEWARD, request as t } from "@/content/copy";

export default function RequestPage() {
  const navigate = useNavigate();
  const items = useLibrary((s) => s.items);
  const kitIds = useLibrary((s) => s.kit);
  const submitRequest = useLibrary((s) => s.submitRequest);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState(GROUPS[0]);
  const [shift, setShift] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  const chosen = kitIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);

  if (sent) {
    return (
      <div className="max-w-lg">
        <h1 className="display text-3xl mb-3">{t.doneHeading}</h1>
        <p className="mb-4">{t.doneBody(STEWARD.name)}</p>
        <ul className="ink bg-card p-4 space-y-1 mb-4">
          {sent.map((s) => (
            <li key={s} className="text-sm font-bold">
              · {s}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mb-6">
          {shift || when} · {SHOP.address}
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to the shelf</Link>
        </Button>
      </div>
    );
  }

  if (chosen.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen />}
        title="Your kit is empty"
        hint="Tap the + on anything on the shelf and it lands here."
        action={
          <Button asChild>
            <Link to="/">Go to the shelf</Link>
          </Button>
        }
      />
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return setError("We need a name and an email to hold gear.");
    if (!shift && !when.trim()) return setError("Pick a shift, or tell us when works for you.");
    setError("");
    setSending(true);
    const names = chosen.map((i) => `${i!.num} — ${i!.name}`);
    window.setTimeout(() => {
      submitRequest({ name, email, phone, group, shift, when, note });
      setSent(names);
      setSending(false);
    }, 400);
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-6">
      <div>
        <h1 className="display text-3xl mb-1">{t.heading}</h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </div>

      <ul className="ink bg-card divide-y-2 divide-border">
        {chosen.map((i) => (
          <li key={i!.id} className="px-3 py-2 text-sm">
            <span className="font-bold tracking-widest text-muted-foreground mr-2">{i!.num}</span>
            {i!.name}
          </li>
        ))}
      </ul>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="group">You ride with</Label>
          <Select id="group" value={group} onChange={(e) => setGroup(e.target.value)}>
            {GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </Select>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="display text-base mb-2">Coming by on</legend>
        <div className="flex flex-wrap gap-2">
          {SHIFTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShift(s === shift ? "" : s)}
              aria-pressed={s === shift}
              className={`ink px-3 min-h-11 font-bold text-sm ${
                s === shift ? "bg-foreground text-background" : "bg-card"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="when">{t.whenLabel}</Label>
          <Input
            id="when"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="Saturday mornings, most weekdays after 6…"
          />
          <p className="text-sm text-muted-foreground">{t.whenHint}</p>
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="note">{t.noteLabel}</Label>
        <Textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="text-sm text-muted-foreground">{t.noteHint}</p>
      </div>

      {error && <p className="text-destructive font-bold">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? t.sending : t.submit}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate("/")}>
          Back
        </Button>
      </div>
    </form>
  );
}