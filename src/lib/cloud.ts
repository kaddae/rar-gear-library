/** Community Cloud, kept behind a small door.
 *
 *  Two rules this file encodes, both deliberate:
 *
 *  1. Writes go out ANONYMOUSLY, without a member token. Cloud documents made
 *     by a member can only be edited by that member — which would mean a loan
 *     Kai handed over couldn't be checked in by anyone else on shift. A crew
 *     shares its queue, so the queue is shared-editable.
 *  2. Privacy comes from visibility, not ownership. Anything carrying a phone
 *     number, an email, or a trip link is created members-only, so it never
 *     appears in a public list.
 *
 *  Reads DO pass the member token, because that is what makes members-only
 *  documents visible at all. */

import { env } from "@/env";

export type CloudDoc<T> = { id: string; data: T; created_at?: string };
export type Member = { id?: string; email: string; name?: string };

export const cloudReady = () =>
  Boolean(env.COMMUNITY_CLOUD_URL && env.APP_ID && env.APP_KEY);

const TOKEN_KEY = "rar-gear-member-token";

export function memberToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setMemberToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private browsing — sign-in just won't stick */
  }
}

export function clearMemberToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}

type AnyResult = Record<string, any>;

async function call(
  action: string,
  collection: string,
  extra: Record<string, unknown> = {},
): Promise<AnyResult> {
  if (!cloudReady()) return { error: "The shared shelf isn't connected." };
  try {
    const res = await fetch(String(env.COMMUNITY_CLOUD_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: env.APP_ID,
        app_key: env.APP_KEY,
        action,
        collection,
        ...extra,
      }),
    });
    return (await res.json()) as AnyResult;
  } catch {
    return { error: "Couldn't reach the shared shelf." };
  }
}

/* ------------------------------------------------------------------ reads */

export async function list<T>(collection: string): Promise<CloudDoc<T>[]> {
  const r = await call("list", collection, { member_token: memberToken() });
  return (r.documents ?? []) as CloudDoc<T>[];
}

/* ----------------------------------------------------------------- writes */

export async function create<T>(
  collection: string,
  data: T,
  opts: { visibility?: "members" } = {},
): Promise<CloudDoc<T> | null> {
  const r = await call("create", collection, { data, ...opts });
  return (r.document ?? null) as CloudDoc<T> | null;
}

export async function update<T>(collection: string, id: string, data: T) {
  const r = await call("update", collection, { id, data });
  return !r.error;
}

export async function remove(collection: string, id: string) {
  const r = await call("delete", collection, { id });
  return !r.error;
}

/* ------------------------------------------------------------------- auth */

export async function authRequest(email: string, name?: string) {
  const r = await call("auth_request", "any", { email, name });
  return { ok: !r.error, error: (r.error as string) ?? "" };
}

export async function authVerify(email: string, code: string) {
  const r = await call("auth_verify", "any", { email, code });
  if (r.member_token) setMemberToken(String(r.member_token));
  return {
    member: (r.member ?? null) as Member | null,
    error: (r.error as string) ?? (r.member_token ? "" : "That code didn't work."),
  };
}

export async function authMe(): Promise<Member | null> {
  if (!memberToken()) return null;
  const r = await call("auth_me", "any", { member_token: memberToken() });
  return (r.member ?? null) as Member | null;
}

export async function authSignout() {
  await call("auth_signout", "any", { member_token: memberToken() });
  clearMemberToken();
}

/* -------------------------------------------------------------- trip keys
 * A loan document is public, so the trip link can't live in it. We publish a
 * hash instead: the borrower's link still finds its loan, and nobody reading
 * the shelf can work backwards to post a trip as someone else. */

export async function hashToken(token: string): Promise<string> {
  try {
    const bytes = new TextEncoder().encode(`rar-gear:${token}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // No crypto (very old browser, or an insecure context) — demo shelf only.
    return `plain:${token}`;
  }
}