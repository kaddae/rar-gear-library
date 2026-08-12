import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/store";
import { kit as t } from "@/content/copy";

export default function KitTray() {
  const kitIds = useLibrary((s) => s.kit);
  const items = useLibrary((s) => s.items);
  const toggleKit = useLibrary((s) => s.toggleKit);
  const clearKit = useLibrary((s) => s.clearKit);

  if (kitIds.length === 0) return null;
  const chosen = kitIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t-2 border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="display text-base mb-1">
            {kitIds.length === 1 ? t.one : t.many(kitIds.length)}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {chosen.map((i) => (
              <li key={i!.id}>
                <button
                  onClick={() => toggleKit(i!.id)}
                  className="ink bg-background px-2 py-1 text-xs font-bold flex items-center gap-1"
                  aria-label={`Take ${i!.name} out of your kit`}
                >
                  {i!.num}
                  <X className="w-3 h-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={clearKit}>
            {t.clear}
          </Button>
          <Button asChild size="lg">
            <Link to="/request">{t.cta}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}