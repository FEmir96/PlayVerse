"use node";
// convex/actions/push.ts
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100;

type ExpoPushMessage = {
  to: string;
  sound?: "default" | null;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  priority?: "default" | "normal" | "high";
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

export const send = action({
  args: {
    userId: v.id("profiles"),
    notificationId: v.id("notifications"),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, { userId, notificationId, title, message, data }) => {
    const tokens = await ctx.runQuery(api.pushTokens.tokensForProfile, { profileId: userId });
    const activeTokens = tokens.filter((token) => !token.disabledAt);
    if (activeTokens.length === 0) {
      return { ok: true as const, sent: 0, skipped: "no_tokens" as const };
    }

    const payloads: ExpoPushMessage[] = activeTokens.map((row) => {
      const extra =
        data && typeof data === "object"
          ? (data as Record<string, unknown>)
          : undefined;
      const mergedData = extra ? { notificationId, ...extra } : { notificationId };
      return {
        to: row.token,
        title,
        body: message,
        sound: "default",
        priority: "high",
        data: mergedData,
      };
    });

    const batches: ExpoPushMessage[][] = [];
    for (let i = 0; i < payloads.length; i += CHUNK_SIZE) {
      batches.push(payloads.slice(i, i + CHUNK_SIZE));
    }

    let sent = 0;
    const invalidTokens: string[] = [];

    for (const batch of batches) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`expo_push_failed:${response.status}:${text}`);
      }

      const json = (await response.json()) as { data?: ExpoPushTicket[] };
      const tickets = json.data ?? [];

      tickets.forEach((ticket, index) => {
        const token = batch[index]?.to;
        if (!token) return;
        if (ticket.status === "ok") {
          sent += 1;
          return;
        }
        const detailError = ticket.details?.error ?? ticket.message ?? "unknown";
        if (
          detailError.includes("DeviceNotRegistered") ||
          detailError.includes("MessageTooBig") ||
          detailError.includes("InvalidCredentials") ||
          detailError.includes("ExpoPushTokenAlreadyUsed") ||
          detailError.includes("PushTooManyNotifications") ||
          detailError.includes("InvalidToken") ||
          detailError.includes("NotRegistered")
        ) {
          invalidTokens.push(token);
        }
      });
    }

    for (const token of invalidTokens) {
      await ctx.runMutation(api.pushTokens.markInvalid, { token });
    }

    return { ok: true as const, sent, invalidTokens };
  },
});
