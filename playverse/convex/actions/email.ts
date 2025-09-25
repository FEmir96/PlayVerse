"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

const RESEND_API_URL = "https://api.resend.com/emails";

// --- helpers --------------------------------------------------------

function normalizeEmail(raw?: string) {
  const s = (raw ?? "").trim();
  return /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(s) ? s : "";
}

function normalizeFrom(raw?: string) {
  const s = (raw ?? "").trim().replace(/\s{2,}/g, " ");
  if (!s) return "";

  // válido: "Nombre <email>" o solo email
  if (/^.+<[^>]+>$/.test(s) || /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(s)) {
    return s;
  }

  // "Nombre email@dominio" -> "Nombre <email@dominio>"
  const parts = s.split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  if (/^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(last)) {
    const name = parts.slice(0, -1).join(" ").trim() || "PlayVerse";
    return `${name} <${last}>`;
  }
  return s;
}

// Usa el remitente del .env; si accidentalmente pusiste un gmail, cae al de Resend onboarding.
function resolveFrom() {
  const raw = process.env.RESEND_FROM || "";
  let from = normalizeFrom(raw);
  if (!from) throw new Error("Falta RESEND_FROM");
  if (/@gmail\.com>?$/i.test(from) || /<[^>]*@gmail\.com>/i.test(from)) {
    // Resend no permite enviar 'from' @gmail.com a terceros → fallback dev
    from = "PlayVerse <onboarding@resend.dev>";
  }
  return from;
}

// --- action principal -----------------------------------------------

export const sendReceiptEmail = action({
  args: {
    to: v.string(),           // destinatario final (el email del usuario logueado)
    subject: v.string(),
    html: v.string(),
    replyTo: v.optional(v.string()), // opcional: si querés forzar un Reply-To específico
  },
  handler: async (_ctx, { to, subject, html, replyTo }) => {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) throw new Error("Falta RESEND_API_KEY");

    const toAddr = normalizeEmail(to);
    if (!toAddr) throw new Error("Destinatario inválido");

    const from = resolveFrom();

    // Reply-To: primero el que te pasan, luego REPLY_TO, si no, omitido.
    const rtFromArg = normalizeEmail(replyTo);
    const rtFromEnv = normalizeEmail(process.env.REPLY_TO);
    const reply_to = rtFromArg || rtFromEnv || undefined;

    const payload: Record<string, any> = { from, to: toAddr, subject, html };
    if (reply_to) payload.reply_to = reply_to;

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend falló: ${res.status} – ${text}`);
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id ?? null, from, reply_to: reply_to ?? null };
  },
});
