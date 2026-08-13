/** Mail goes through Community Cloud's capability proxy: the Resend key stays
 *  vaulted server-side, so this works in the preview, on the hosted site, and
 *  anywhere else this app is deployed. Every caller checks the result — sends
 *  fail sometimes, and a crew should never be left guessing. */

import { env } from "@/env";

export type SendResult = { ok: boolean; error: string };

export async function sendEmail(o: {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const url =
    env.COMMUNITY_CAPABILITIES_URL ??
    env.COMMUNITY_CLOUD_URL?.replace(/app-data$/, "app-capabilities");
  if (!url || !env.APP_ID || !env.APP_KEY)
    return { ok: false, error: "Email isn't connected yet." };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send_email",
        app_id: env.APP_ID,
        app_key: env.APP_KEY,
        to: o.to,
        subject: o.subject,
        text: o.text,
        ...(o.replyTo ? { reply_to: o.replyTo } : {}),
      }),
    });
    const r = await res.json();
    return r?.error ? { ok: false, error: String(r.error) } : { ok: true, error: "" };
  } catch {
    return { ok: false, error: "Couldn't reach the mail service." };
  }
}