// All user-facing words live here. Edit this file, not the components.

export const SHOP = {
  name: "RAR New Haven Gear Library",
  org: "RAR New Haven + The Bradley Street Bicycle Co-op",
  address: "138 Bradley St, New Haven",
  neighborhood: "East Rock",
};

export const STEWARD = {
  name: "Kai (and the rest of RAR New Haven!)",
  line: "Kai manages this library — say hi at the shop.",
  /** Every request emails a copy here. One-line edit to point it elsewhere. */
  email: "rarnewhaven@gmail.com",
};

export const SHIFTS = ["Volunteer Monday, 4–7pm", "Tuesday, 4–7pm", "Thursday, 4–7pm"];

export const GROUPS = ["Bradley Street Co-op", "RAR New Haven", "Neither / just found this"];

export const LOAN_DAYS = 14;

/** Someone can tap a shift AND type their own window — crew needs to see both. */
export const whenText = (o: { shift?: string; when?: string }) =>
  [o.shift, o.when].filter((s) => s && s.trim()).join(" · or ") || "Whenever the shop is open";

export const wall = {
  counter: (on: number, total: number) => `${on} of ${total} on the shelf`,
  showing: (n: number) => `${n} ${n === 1 ? "thing" : "things"} match`,
  empty: "Nothing in the library yet — add the first thing from the crew page.",
  all: "Everything",
  inOnly: "In right now",
  search: "Search the library",
  noMatch: "Nothing matches that",
  noMatchHint: "Try a shorter word — brand, or where it mounts.",
  clear: "Clear filters",
  outLabel: "out",
  onShelf: "available",
  howMany: "How many?",
  stock: (total: number, free: number) =>
    `${total} in the library · ${free === 0 ? "none free right now" : `${free} free right now`}`,
  allOfThem: (n: number) => `That's all ${n} of them.`,
  askAnyway: "Asking for more than are free is fine — pickup is days away.",
  lostAsk:
    "Missing since its last trip. Seen it? Tell the crew — no questions asked, we'd just like it back so other people can use it to have rad trips!",
  repairNote: "On the repair stand. Ask the crew when it'll be back up.",
  cantRequest: "Not lendable right now — the crew is on it.",
  storiesHeading: "Where it's been",
  photoSlot: "Add a real photo here",
  photoHint: "Files tab → Add photo, name it after the item number",
};

export const states = {
  available: { label: "On the shelf", tag: "on the shelf", tint: "#EEEADD", ink: "#111111" },
  out: { label: "Out", tag: "all out", tint: "#EEEADD", ink: "#111111" },
  repair: { label: "Needs repair", tag: "in the stand", tint: "#E8C56B", ink: "#111111" },
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
  qty: (n: number) => `×${n}`,
  drop: (name: string) => `Take ${name} out of your kit`,
  more: (name: string) => `Add another ${name}`,
  fewer: (name: string) => `One fewer ${name}`,
};

export const request = {
  heading: "Request your kit",
  sub: `Two-week loan. Gear changes hands at the shop — ${SHOP.address}.`,
  noteLabel: "Anything we should know?",
  noteHint:
    "Only the crew sees this. Where you're headed, what you've done before, what you're unsure about. If you want a particular one off the wall, say so here.",
  whenLabel: "Or tell us when works",
  whenHint: "If none of those shifts fit, say when you can get there and we'll figure it out.",
  submit: "Send the request",
  sending: "Sending…",
  doneHeading: "Got it.",
  doneBody: (name: string) =>
    `We'll have this pulled and waiting. Ask for ${name} at the counter.`,
  emailed: (email: string) => `Confirmation on its way to ${email}.`,
  emailFailed: "Couldn't send the confirmation email — the crew still has your request.",
};

export const crew = {
  heading: "Librarians",
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
  log: "Log",
  logHeading: "Every hand-off, newest first",
  logEmpty: "Nothing has gone out yet. The first hand-over writes the first line.",
  logFilter: "Filter by tag, item, or name",
  logNoMatch: "Nothing in the log matches that.",
  logOut: "went out",
  logBack: "came back",
  logStill: "still out",
  logCount: (n: number) => `${n} ${n === 1 ? "hand-off" : "hand-offs"}`,
  signInHeading: "Crew sign-in",
  signInBody:
    "Requests carry people's phone numbers and notes, so they only open for signed-in crew. A code comes by email — no password to remember.",
  signInSend: "Send me a code",
  signInSending: "Sending…",
  signInCode: "6-digit code",
  signInVerify: "Sign in",
  signInAgain: "Send another code",
  signOut: "Sign out",
  codeSent: (email: string) => `Code sent to ${email}. Good for a few minutes.`,
  noneFree: "none on shelf",
  unitOf: (n: number, of: number) => `#${n} of ${of}`,
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
    a: "Yes, this library is for BSBC members and RAR riders. If you want to become one of either, please reach out!",
  },
  {
    q: "Is there a deposit or a fee?",
    a: "No! Borrowing gear is totally free, but is only open to RAR or BSBC members.",
    },
  {
    q: "What if I break something, or it doesn't come back?",
    a: "If something is broken or is lost, we will work with you to figure out the best way to replace the item! If you have $ to donate, that's great, and if not, that's okay. You aren't on the hook for the replacement cost, but we do reserve the right to stop lending items to folks when there is a trend of being careless with this shared gear. This library is meant to serve our whole community, and taking good care of each item is integral to that. ",
  },
  {
    q: "How long can I keep it?",
    a: `Two weeks from pickup. If you need longer, let us know — we can be flexible!`,
  },
  {
    q: "I've never bikepacked. Is this for me?",
    a: "Yes. That's most of why this exists. Nobody here will quiz you about your setup. Say so in your request and someone will walk you through packing it at the shop.",
  },
  {
    q: "When can I pick things up?",
    a: `Gear changes hands at ${SHOP.address} during open shifts: ${SHIFTS.join(", ")}. If none of those work, say so in your request and the crew will sort something out.`,
  },
  {
    q: "Can I request multiple items at once?",
    a: "Yes! Add everything you want, then send one request. You'll get one message back listing all of it.",
  },
  {
    q: "What happens to the trip stories and photos?",
    a: "We only put them up if you say yes, and only use your first name. Ask any crew member to take one down and it's gone that day.",
  },
];

export const emails = {
  holdConfirmation: (o: { name: string; items: string[]; when: string }) =>
    `Hey ${o.name.split(" ")[0]} — the gear library has your request.\n\n${o.items
      .map((i) => `· ${i}`)
      .join("\n")}\n\nPickup: ${o.when}, at ${SHOP.address}.\nAsk for ${STEWARD.name} at the counter.\n\nTwo-week loan. Use it hard, bring it back.\n— ${SHOP.org}`,
  crewCopy: (o: {
    name: string;
    email: string;
    phone: string;
    group: string;
    items: string[];
    when: string;
    note: string;
  }) =>
    `New gear request.\n\n${o.name}${o.phone ? ` · ${o.phone}` : ""}\n${o.email}\nRides with: ${
      o.group
    }\nComing by: ${o.when}\n\n${o.items.map((i) => `· ${i}`).join("\n")}${
      o.note ? `\n\nThey said:\n${o.note}` : ""
    }\n\nIt's in the Waiting tab — sign in on the crew page to hand it over.`,
  subjects: {
    hold: "Your gear library request",
    crew: (name: string) => `Gear request from ${name}`,
    nudge: "Where'd it go?",
  },
  storyNudge: (o: { name: string; link: string }) =>
    `Hey ${o.name.split(" ")[0]} — thanks for bringing that back.\n\nWhere'd it go? One or two lines, a photo if you got one. We put them next to the gear so the next person can see where it's been.\n\n${o.link}\n\n— ${SHOP.org}`,
};
