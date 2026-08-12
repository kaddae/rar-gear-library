import { HashRouter, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import KitTray from "@/components/KitTray";
import Wall from "@/pages/Wall";
import RequestPage from "@/pages/Request";
import Faq from "@/pages/Faq";
import Crew from "@/pages/Crew";
import TripStory from "@/pages/TripStory";
import { useLibrary } from "@/store";
import { SHOP, STEWARD, SHIFTS } from "@/content/copy";

function Shell({ children }: { children: React.ReactNode }) {
  const persona = useLibrary((s) => s.persona);
  const setPersona = useLibrary((s) => s.setPersona);
  const { pathname } = useLocation();
  const showTray = pathname === "/";

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 text-sm font-bold ${isActive ? "bg-foreground text-background" : "hover:underline"}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b-2 border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-baseline gap-2 min-w-0">
            <span className="display text-lg sm:text-2xl truncate">{SHOP.name}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <NavLink to="/" className={link} end>
              Shelf
            </NavLink>
            <NavLink to="/faq" className={link}>
              FAQ
            </NavLink>
            {persona === "crew" && (
              <NavLink to="/crew" className={link}>
                Crew
              </NavLink>
            )}
            <label className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 border-l-2 border-border cursor-pointer">
              <Wrench className="w-4 h-4" aria-hidden />
              <span className="sr-only sm:not-sr-only text-sm font-bold">Crew</span>
              <Switch
                checked={persona === "crew"}
                onCheckedChange={(v: boolean) => setPersona(v ? "crew" : "borrower")}
                aria-label="Switch to crew view"
              />
            </label>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 pb-28">{children}</main>

      <footer className="border-t-2 border-border bg-muted">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          <div>
            <p className="font-bold">{STEWARD.line}</p>
            <p className="text-muted-foreground">
              {SHOP.address} · {SHOP.org}
            </p>
          </div>
          <p className="text-muted-foreground sm:text-right">
            {SHIFTS.map((s) => (
              <span key={s} className="block">
                {s}
              </span>
            ))}
          </p>
        </div>
      </footer>

      {showTray && <KitTray />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Wall />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/trip/:token" element={<TripStory />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}