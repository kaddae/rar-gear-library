import { faq, SHOP, STEWARD } from "@/content/copy";

export default function Faq() {
  return (
    <div className="max-w-2xl">
      <h1 className="display text-3xl mb-6">Questions people actually ask</h1>
      <dl className="space-y-4">
        {faq.map((f) => (
          <div key={f.q} className="ink bg-card p-4">
            <dt className="display text-lg mb-1">{f.q}</dt>
            <dd className={f.needsYourWords ? "text-sm font-bold text-destructive" : ""}>{f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">
        Still stuck? {STEWARD.line} {SHOP.address}.
      </p>
    </div>
  );
}