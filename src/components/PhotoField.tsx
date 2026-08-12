import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readPhoto } from "@/lib/photo";

export default function PhotoField({
  value,
  onChange,
  label = "Add a photo",
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await readPhoto(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that photo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="ink max-h-40 object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove photo"
            className="absolute -top-2 -right-2 h-9 w-9 ink bg-background flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          <Camera className="w-4 h-4 mr-2" aria-hidden />
          {busy ? "Reading…" : label}
        </Button>
      )}
      {error && <p className="text-sm text-destructive font-bold">{error}</p>}
    </div>
  );
}