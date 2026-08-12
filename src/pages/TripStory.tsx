import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhotoField from "@/components/PhotoField";
import { useLibrary } from "@/store";
import { trip as t, SHOP } from "@/content/copy";

export default function TripStory() {
  const { token } = useParams();
  const loans = useLibrary((s) => s.loans);
  const items = useLibrary((s) => s.items);
  const stories = useLibrary((s) => s.stories);
  const addStory = useLibrary((s) => s.addStory);

  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const loan = loans.find((l) => l.token === token);

  if (!loan) {
    return (
      <div className="max-w-lg">
        <h1 className="display text-3xl mb-3">{t.heading}</h1>
        <p className="mb-6">{t.expired}</p>
        <Button asChild variant="outline">
          <Link to="/">Back to the shelf</Link>
        </Button>
      </div>
    );
  }

  const already = stories.some((s) => s.loanId === loan.id);
  const gear = loan.items
    .map((i) => items.find((g) => g.id === i.itemId))
    .filter(Boolean) as { num: string; name: string }[];

  if (sent || already) {
    return (
      <div className="max-w-lg">
        <h1 className="display text-3xl mb-3">{t.done}</h1>
        <p className="text-muted-foreground mb-6">
          {SHOP.name} · {SHOP.address}
        </p>
        <Button asChild variant="outline">
          <Link to="/">See the shelf</Link>
        </Button>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loan || !text.trim()) return;
    addStory({
      loanId: loan.id,
      firstName: loan.borrowerName.split(" ")[0],
      itemIds: loan.items.map((i) => i.itemId),
      text: text.trim(),
      photo,
    });
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-5">
      <div>
        <h1 className="display text-3xl mb-1">{t.heading}</h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </div>

      <ul className="ink bg-card divide-y-2 divide-border">
        {gear.map((g) => (
          <li key={g.num} className="px-3 py-2 text-sm">
            <span className="font-bold tracking-widest text-muted-foreground mr-2">{g.num}</span>
            {g.name}
          </li>
        ))}
      </ul>

      <div className="space-y-1.5">
        <Label htmlFor="text">Your trip, {loan.borrowerName.split(" ")[0]}</Label>
        <Textarea
          id="text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Where you went, what surprised you, what you'd tell the next person…"
        />
        <p className="text-sm text-muted-foreground">
          Goes up with your first name only. Ask any crew member to take it down and it&rsquo;s gone
          that day.
        </p>
      </div>

      <PhotoField value={photo} onChange={setPhoto} label="Add a photo" />

      <Button type="submit" size="lg" disabled={!text.trim()}>
        {t.submit}
      </Button>
    </form>
  );
}