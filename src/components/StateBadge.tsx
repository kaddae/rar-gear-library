import { type ItemState } from "@/store";
import { states } from "@/content/copy";

export default function StateBadge({
  state,
  className = "",
}: {
  state: ItemState;
  className?: string;
}) {
  const s = states[state];
  return (
    <span
      className={`ink px-1.5 py-0.5 text-xs font-bold inline-flex items-center gap-1 shrink-0 ${className}`}
      style={{ background: s.tint, color: s.ink }}
    >
      {state === "out" && <span className="out-dot" aria-hidden />}
      {s.tag}
    </span>
  );
}