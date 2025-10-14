// convex/lib/emailTemplates.ts
export type BaseOpts = {
  userName?: string | null;
  gameTitle: string;
  coverUrl?: string | null;
  amount: number;
  currency?: string;
  method?: string;
  orderId?: string | null;
  appUrl?: string | null;
  weeks?: number;
  expiresAt?: number;
};

const COLORS = {
  bgOuter:   "#0b1220",
  cardBg:    "#0f172a",
  border:    "#1f2937",
  brand:     "#fb923c",
  accent:    "#fbbf24",
  text:      "#e5e7eb",
  textSoft:  "#cbd5e1",
  textMuted: "#94a3b8",
  footer:    "#64748b",
};

function esc(s: string) {
  return s.replace(/[<>&"]/g, (c) => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!
  ));
}

function cover(url?: string | null, alt?: string) {
  if (!url) return "";
  return `
    <img src="${url}" alt="${esc(alt || "Cover")}"
      style="width:100%;max-width:560px;height:auto;border-radius:12px;display:block;outline:none;text-decoration:none;margin:8px 0 6px 0;object-fit:cover;" />
  `;
}

function layout(title: string, intro: string, inner: string) {
  return `<!doctype html><html><body style="background:${COLORS.bgOuter};margin:0;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:${COLORS.text}">
    <div style="max-width:680px;margin:0 auto;background:${COLORS.cardBg};border:1px solid ${COLORS.border};border-radius:16px;padding:20px">
      <h1 style="color:${COLORS.brand};margin:0 0 8px 0;font-size:22px;">${title}</h1>
      <p style="color:${COLORS.textSoft};margin:0 0 16px 0;font-size:14px">${intro}</p>
      ${inner}
    </div>
    <p style="text-align:center;color:${COLORS.footer};font-size:12px;margin-top:12px">© ${new Date().getFullYear()} PlayVerse</p>
  </body></html>`;
}

function infoBlock(opts: BaseOpts, extraRows = "") {
  const money  = opts.amount.toLocaleString("en-US", { style: "currency", currency: opts.currency ?? "USD" });
  const method = opts.method ?? "Tarjeta";
  const order  = opts.orderId ? `<div style="margin-top:6px"><strong>ID de pedido:</strong> ${esc(opts.orderId)}</div>` : "";
  const cta    = opts.appUrl
    ? `<div style="margin-top:16px">
         <a href="${opts.appUrl}" style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">Ir a PlayVerse</a>
       </div>`
    : "";

  return `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;padding:16px">
      <h2 style="color:#fff;margin:0 0 8px 0;font-size:18px">${esc(opts.gameTitle)}</h2>
      ${cover(opts.coverUrl, opts.gameTitle)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;color:${COLORS.textSoft};font-size:14px">
        <tr>
          <td align="left"  style="width:50%;padding:6px 0"><strong>Monto:</strong>
            <span style="color:${COLORS.accent};font-weight:700">${money}</span>
          </td>
          <td align="right" style="width:50%;padding:6px 0"><strong>Método:</strong> ${esc(method)}</td>
        </tr>
        ${
          extraRows
            ? `<tr><td colspan="2" style="padding-top:6px"><div style="display:flex;gap:12px;flex-wrap:wrap;color:${COLORS.textSoft};font-size:14px">${extraRows}</div></td></tr>`
            : ""
        }
      </table>
      ${order}
      ${cta}
    </div>`;
}

/* ========== builders existentes ========== */
export function buildPurchaseEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, gracias por tu compra en PlayVerse.`;
  const inner = infoBlock(opts);
  return layout("Compra confirmada", intro, inner);
}

export function buildRentalEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, tu alquiler fue confirmado.`;
  const extra = (() => {
    const chips: string[] = [];
    if (typeof opts.weeks === "number") chips.push(`<div><strong>Semanas:</strong> ${opts.weeks}</div>`);
    if (typeof opts.expiresAt === "number") {
      const expires = new Date(opts.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      chips.push(`<div><strong>Vence:</strong> ${expires}</div>`);
    }
    return chips.join("");
  })();

  const inner = infoBlock(opts, extra);
  return layout("Alquiler confirmado", intro, inner);
}

export function buildExtendEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, extendimos tu alquiler.`;
  const extra = (() => {
    const chips: string[] = [];
    if (typeof opts.weeks === "number") chips.push(`<div><strong>Semanas +:</strong> ${opts.weeks}</div>`);
    if (typeof opts.expiresAt === "number") {
      const expires = new Date(opts.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      chips.push(`<div><strong>Nuevo venc.:</strong> ${expires}</div>`);
    }
    return chips.join("");
  })();

  const inner = infoBlock(opts, extra);
  return layout("Extensión confirmada", intro, inner);
}

// ---- NUEVO: email para compras de carrito ----
export type CartEmailItem = {
  title: string;
  coverUrl?: string | null;
  amount: number;
};

export function buildCartEmail(opts: {
  userName?: string | null;
  items: CartEmailItem[];
  currency?: string;
  method?: string;
  appUrl?: string | null;
}) {
  const cur = opts.currency || "USD";
  const total = opts.items.reduce((a, it) => a + (it.amount || 0), 0);

  const rows = opts.items.map((it) => {
    const money = it.amount.toLocaleString("en-US", { style: "currency", currency: cur });
    return `
      <tr>
        <td style="padding:8px 12px">
          <div style="display:flex;gap:12px;align-items:center">
            ${it.coverUrl ? `<img src="${it.coverUrl}" width="56" height="56" style="border-radius:10px;display:block" />` : ""}
            <div style="color:#fff;font-weight:600">${esc(it.title)}</div>
          </div>
        </td>
        <td align="right" style="padding:8px 12px;color:${COLORS.accent};font-weight:700">${money}</td>
      </tr>`;
  }).join("");

  const inner = `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate">
        ${rows}
        <tr><td colspan="2" style="height:1px;background:${COLORS.border}"></td></tr>
        <tr>
          <td style="padding:10px 12px;color:${COLORS.textSoft};font-weight:700">Total</td>
          <td align="right" style="padding:10px 12px;color:${COLORS.accent};font-weight:900">
            ${total.toLocaleString("en-US", { style: "currency", currency: cur })}
          </td>
        </tr>
      </table>
    </div>
    ${opts.appUrl ? `<div style="margin-top:16px">
      <a href="${opts.appUrl}" style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">Ir a PlayVerse</a>
    </div>` : ""}
  `;

  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, confirmamos tu compra de varios ítems en PlayVerse.`;
  return layout("Compra confirmada (Carrito)", intro, inner);
}
export default {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
  buildCartEmail, // ← NUEVO
};
