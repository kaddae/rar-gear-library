// All user-facing words live here. Edit this file, not the components.

export const SHOP = {
  name: "Bradley Street Gear Library",
  org: "Bradley Street Bicycle Co-op + RAR New Haven",
  address: "138 Bradley St, New Haven",
  neighborhood: "East Rock",
};

export const STEWARD = {
  name: "Kai",
  line: "Kai keeps this shelf — say hi at the shop.",
};

export const SHIFTS = ["Volunteer Monday, 4–7pm", "Tuesday, 4–7pm", "Thursday, 4–7pm"];

export const GROUPS = ["Bradley Street Co-op", "RAR New Haven", "Neither / just found this"];

export const LOAN_DAYS = 14;

export const wall = {
  counter: (on: number, total: number) => `${on} of ${total} on the shelf`,
  showing: (n: number) => `${n} ${n === 1 ? "thing" : "things"} match`,
  empty: "Nothing on the shelf yet — add the first thing from the crew page.",
  all: "Everything",
  inOnly: "In right now",
  search: "Search the shelf",
  noMatch: "Nothing matches that",
  noMatchHint: "Try a shorter word — brand, or where it mounts.",
  clear: "Clear filters",
  outLabel: "out",
  onShelf: "on the shelf",
  lostAsk:
    "Missing since its last trip. Seen it? Tell the crew — no questions asked, we'd just like it back on the board.",
  repairNote: "On the repair stand. Ask the crew when it'll be back up.",
  cantRequest: "Not lendable right now — the crew is on it.",
  storiesHeading: "Where it's been",
  photoSlot: "Add a real photo here",
  photoHint: "Files tab → Add photo, name it after the item number",
};

export const states = {
  available: { label: "On the shelf", tag: "on the shelf", tint: "#EEEADD", ink: "#111111" },
  out: { label: "Out", tag: "all out", tint: "#EEEADD", ink: "#111111" },
  repair: { label: "Needs work", tag: "in the stand", tint: "#E8C56B", ink: "#111111" },
  missing: { label: "Missing", tag: "missing", tint: "#111111", ink: "#EEEADD" },
  retired: { label: "Retired", tag: "retired", tint: "#D7D2C2", ink: "#55503F" },
};

export const copyWords = {
  which: "Which one goes out",
  tagLabel: "Tag",
  noteLabel: "This one's quirk",
  addCopy: "Add another one",
  removeCopy: "Remove this copy",
  acquired: "Got it",
  price: "Paid",
  source: "From",
  training: "Crew shows you how before this one leaves",
  sizeLabel: "Size / fit",
  seasonLabel: "Season",
  weightLabel: "Weight",
  dimsLabel: "Packed size",
  manual: "Manual (PDF)",
  listing: "Product page",
  careLabel: "While you have it",
  returnLabel: "Bringing it back",
};

export const impact = (o: { loans: number; people: number; trips: number }) =>
  `${o.loans} ${o.loans === 1 ? "loan" : "loans"} · ${o.people} ${
    o.people === 1 ? "rider" : "riders"
  } · ${o.trips} ${o.trips === 1 ? "trip" : "trips"} logged since this shelf opened.`;

export const kit = {
  one: "1 thing in your kit",
  many: (n: number) => `${n} things in your kit`,
  cta: "Request these",
  clear: "Empty kit",
};

export const request = {
  heading: "Request your kit",
  sub: `Two-week loan. Gear changes hands at the shop — ${SHOP.address}.`,
  noteLabel: "Anything we should know?",
  noteHint: "Only the crew sees this. Where you're headed, what you've done before, what you're unsure about.",
  whenLabel: "Or tell us when works",
  whenHint: "If none of those shifts fit, say when you can get there and we'll figure it out.",
  submit: "Send the request",
  sending: "Sending…",
  doneHeading: "Got it.",
  doneBody: (name: string) =>
    `We'll have this pulled and waiting. Ask for ${name} at the counter.`,
};

export const crew = {
  heading: "Crew",
  holds: "Waiting",
  out: "Out",
  shelf: "Shelf",
  noHolds: "Nothing waiting. The shelf is caught up.",
  noOut: "Nothing is out right now.",
  needsWork: "Back, but it needs work",
  everything: "Everything",
  nothingHere: "Nothing in this state right now.",
  storyPrompt: "Where'd it go?",
  storyHint: "Type it while they're standing there, or skip and send them the link.",
  consent: "Ask out loud before you post it: “okay if this goes on the site?” First names only.",
  trips: "Trips",
  noTrips: "No trips logged yet. The first one gets written at a check-in.",
  skip: "Skip — send them the link",
  paste: "Paste from a spreadsheet",
  pasteHint:
    "Paste straight from Google Sheets, header row and all — one row per physical thing. It reads your column names (Number, Item Name, Brand, Model, Condition, Size, Weight, Categories…), so column order doesn't matter. Rows sharing a name and brand become copies of one catalog entry.",
  pasteReading: (r: number, c: number, i: number) =>
    `${r} rows → ${i} ${i === 1 ? "entry" : "entries"}, ${c} ${c === 1 ? "copy" : "copies"}`,
  pasteUnknown: (cols: string[]) => `Ignored columns: ${cols.join(", ")}`,
  pasteMissing: "No Item Name or Number column found — paste the header row too.",
  commit: "Add these to the shelf",
};

export const trip = {
  heading: "Where'd it go?",
  sub: "One or two lines is plenty. We put these next to the gear so the next person can see where it's been.",
  submit: "Add it",
  done: "Thanks — that's up next to the gear now.",
  expired: "This link isn't active. Ask the crew at the shop and they'll add it for you.",
};

export const faq: { q: string; a: string; needsYourWords?: boolean }[] = [
  {
    q: "Do I have to be a co-op member to borrow?",
    a: "No. If you can get to the shop during open hours, you can borrow. Members, RAR riders, and people who just found this page are all the same to us.",
  },
  {
    q: "Is there a deposit or a fee?",
    a: "TODO: write this in your own voice — what the co-op actually asks for, if anything, and what happens if someone can't pay it.",
    needsYourWords: true,
  },
  {
    q: "What if I break something, or it doesn't come back?",
    a: "TODO: write this in your own voice — how the crew actually handles a busted zipper or a lost stake on a Saturday afternoon. Say the forgiving version out loud, because people who've never borrowed gear assume the worst.",
    needsYourWords: true,
  },
  {
    q: "How long can I keep it?",
    a: `Two weeks from pickup. If you need longer, tell the crew — that's a conversation, not a fine.`,
  },
  {
    q: "I've never bikepacked. Is this for me?",
    a: "Yes. That's most of why this exists. Nobody here will quiz you about your setup. Say so in the request and someone will walk you through packing it at the shop.",
  },
  {
    q: "When can I pick things up?",
    a: `Gear changes hands at ${SHOP.address} during open shifts: ${SHIFTS.join(", ")}. If none of those work, say so in your request and the crew will sort something out.`,
  },
  {
    q: "Can I request a whole kit at once?",
    a: "That's the point. Tap everything you want, then send one request. You'll get one message back listing all of it.",
  },
  {
    q: "What happens to the trip stories and photos?",
    a: "We only put them up if you say yes, and only your first name. Ask any crew member to take one down and it's gone that day.",
  },
];

export const emails = {
  holdConfirmation: (o: { name: string; items: string[]; when: string }) =>
    `Hey ${o.name.split(" ")[0]} — the gear library has your request.\n\n${o.items
      .map((i) => `· ${i}`)
      .join("\n")}\n\nPickup: ${o.when}, at ${SHOP.address}.\nAsk for ${STEWARD.name} at the counter.\n\nTwo-week loan. Use it hard, bring it back.\n— ${SHOP.org}`,
  storyNudge: (o: { name: string; link: string }) =>
    `Hey ${o.name.split(" ")[0]} — thanks for bringing that back.\n\nWhere'd it go? One or two lines, a photo if you got one. We put them next to the gear so the next person can see where it's been.\n\n${o.link}\n\n— ${SHOP.org}`,
};