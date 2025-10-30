// convex/lib/emailTemplates.ts

export type BaseOpts = {
  userName?: string | null;
  gameTitle: string;
  coverUrl?: string | null;
  amount: number;
  currency?: string;
  method?: string;
  orderId?: string | null;
  appUrl?: string | null; // CTA a la app
  weeks?: number;
  expiresAt?: number;
};

const COLORS = {
  bgOuter: "#0b1220",
  cardBg: "#0f172a",
  border: "#1f2937",
  brand: "#fbbf24",
  accent: "#fbbf24",
  text: "#fbbf24",
  textSoft: "#fbbf24",
  textMuted: "#fbbf24",
  footer: "#64748b",
};

// Fallback seguro a tu mini-repo por si la env faltara
const DEFAULT_ASSETS_BASE = "https://pv-assets.vercel.app";

function esc(s: string) {
  return s.replace(/[<>&"]/g, (c) => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!
  ));
}

/* ========= Helpers de assets e íconos ========= */

function assetsBase(): string {
  const env = (process.env.ASSETS_BASE_URL || "").trim();
  return (env || DEFAULT_ASSETS_BASE).replace(/\/+$/, "");
}

function asset(path: string): string {
  const base = assetsBase();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

function iconImg(src: string, alt: string, size = 20, extra = "") {
  const url = asset(src);
  return `<img src="${url}" width="${size}" height="${size}" alt="${esc(alt)}" style="display:inline-block;vertical-align:middle;border:0;outline:none;${extra}" />`;
}

const ICONS = {
  logo: "/images/playverse-logo.png",
  mushroom: "/images/hongo.png",
  star: "/images/estrella.png",
  controller: "/images/control.png",
  inv1: "/images/rob1.png",
  inv2: "/images/rob2.png",
  coin: "/images/moneda.png",
  amount: "/images/moneda.png",
  method: "/images/control.png",
  weeks: "/images/estrella.png",
  expires: "/images/rob2.png",
};

/* ========= Piezas visuales reutilizables ========= */

function decorativeStrip() {
  const size = 22;
  const op = "opacity:.65;filter:drop-shadow(0 1px 0 rgba(0,0,0,.25));";
  const gap = 10;

  const icons = [
    { s: ICONS.mushroom, a: "Hongo" },
    { s: ICONS.star, a: "Estrella" },
    { s: ICONS.controller, a: "Control" },
    { s: ICONS.inv1, a: "Alien 1" },
    { s: ICONS.coin, a: "Moneda" },
    { s: ICONS.inv2, a: "Alien 2" },
  ];

  const imgs = icons
    .map(({ s, a }) => iconImg(s, a, size, op))
    .join(`<span style="display:inline-block;width:${gap}px"></span>`);

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0 0 12px 0">
    <tr>
      <td align="center" style="padding:8px 0">
        ${imgs}
      </td>
    </tr>
  </table>`;
}

function brandHeader() {
  const logoUrl = asset(ICONS.logo);
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0 0 8px 0">
    <tr>
      <td align="center" style="padding:0 0 6px 0">
        <img src="${logoUrl}" width="120" height="60" alt="PlayVerse" style="display:block;border:0;outline:none;height:auto" />
      </td>
    </tr>
  </table>`;
}

/* ========= Layout base del email ========= */

function layout(title: string, intro: string, inner: string, appUrl?: string | null) {
  return `<!doctype html>
<html>
  <body style="background:${COLORS.bgOuter};margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:${COLORS.text};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="max-width:720px;margin:0 auto">
      ${brandHeader()}
      ${decorativeStrip()}
    </div>

    <div style="max-width:720px;margin:0 auto;background:${COLORS.cardBg};border:1px solid ${COLORS.border};border-radius:16px;padding:22px">
      <h1 style="color:${COLORS.brand};margin:0 0 10px 0;font-size:22px;line-height:1.25;letter-spacing:.2px">${title}</h1>
      <p style="color:${COLORS.textSoft};margin:0 0 18px 0;font-size:14px;line-height:1.65">${intro}</p>
      ${inner}
    </div>

    <p style="text-align:center;color:${COLORS.footer};font-size:12px;margin-top:12px;line-height:1.5">
      © ${new Date().getFullYear()} PlayVerse · Este es un correo automático, no respondas a este mensaje.<br/>
      Si necesitás ayuda, visitá nuestro centro de ayuda dentro de la app.
    </p>
  </body>
</html>`;
}

/* ========= Cabecera compacta título + miniatura ========= */

function titleWithThumb(title: string, coverUrl?: string | null) {
  if (!coverUrl) {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0 0 8px 0">
        <tr>
          <td style="padding:0">
            <div style="color:${COLORS.accent};font-size:18px;line-height:1.3;font-weight:800">${esc(title)}</div>
          </td>
        </tr>
      </table>
    `;
  }
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0 0 8px 0">
      <tr>
        <td width="56" valign="middle" style="padding:0">
          <img src="${coverUrl}" width="56" height="56" alt="Cover ${esc(title)}" style="display:block;border-radius:10px" />
        </td>
        <td valign="middle" style="padding-left:10px">
          <div style="color:${COLORS.accent};font-size:18px;line-height:1.3;font-weight:800">${esc(title)}</div>
        </td>
      </tr>
    </table>
  `;
}

/* ========= Bloque de información principal ========= */

function infoBlock(opts: BaseOpts, extraRows = "") {
  const money = opts.amount.toLocaleString("en-US", { style: "currency", currency: opts.currency ?? "USD" });
  const method = opts.method ?? "Tarjeta";
  const order = opts.orderId ? `<div style="margin-top:8px;color:${COLORS.accent};font-size:12px"><strong>ID de pedido:</strong> ${esc(opts.orderId)}</div>` : "";
  const cta = opts.appUrl
    ? `<div style="margin-top:16px">
         <a href="${opts.appUrl}" style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:800;letter-spacing:.2px">Ir a PlayVerse</a>
       </div>`
    : "";

  const iconAmount = iconImg(ICONS.amount, "Monto", 18, "opacity:.9;margin-right:6px");
  const iconMethod = iconImg(ICONS.method, "Método", 18, "opacity:.9;margin-right:6px");

  return `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;padding:16px">
      ${titleWithThumb(opts.gameTitle, opts.coverUrl)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;color:${COLORS.accent};font-size:14px;margin-top:6px">
        <tr>
          <td align="left"  style="width:50%;padding:7px 0">
            ${iconAmount}
            <strong style="color:${COLORS.accent}">Monto:</strong>
            <span style="color:${COLORS.accent};font-weight:900;margin-left:6px">${money}</span>
          </td>
          <td align="right" style="width:50%;padding:7px 0">
            ${iconMethod}
            <strong style="color:${COLORS.accent}">Método:</strong>
            <span style="margin-left:6px;color:${COLORS.accent};font-weight:700">${esc(method)}</span>
          </td>
        </tr>
        ${extraRows
      ? `<tr><td colspan="2" style="padding-top:10px">
                 <div style="display:flex;gap:14px;flex-wrap:wrap;color:${COLORS.accent};font-size:14px">${extraRows}</div>
               </td></tr>`
      : ""
    }
      </table>

      ${order}
      ${cta}
    </div>`;
}

/* ========= Builders ========= */

export function buildPurchaseEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, gracias por tu compra en PlayVerse.`;
  const inner = infoBlock(opts);
  return layout("Compra confirmada", intro, inner, opts.appUrl);
}

export function buildRentalEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, tu alquiler fue confirmado.`;
  const extra = (() => {
    const chips: string[] = [];
    if (typeof opts.weeks === "number") {
      const ico = iconImg(ICONS.weeks, "Semanas", 16, "opacity:.9;margin-right:6px");
      chips.push(`<div style="display:flex;align-items:center"><span>${ico}<strong style="color:${COLORS.accent}">Semanas:</strong>&nbsp;${opts.weeks}</span></div>`);
    }
    if (typeof opts.expiresAt === "number") {
      const ico = iconImg(ICONS.expires, "Vence", 16, "opacity:.9;margin-right:6px");
      const expires = new Date(opts.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      chips.push(`<div style="display:flex;align-items:center"><span>${ico}<strong style="color:${COLORS.accent}">Vence:</strong>&nbsp;${expires}</span></div>`);
    }
    return chips.join("");
  })();

  const inner = infoBlock(opts, extra);
  return layout("Alquiler confirmado", intro, inner, opts.appUrl);
}

export function buildExtendEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, extendimos tu alquiler.`;
  const extra = (() => {
    const chips: string[] = [];
    if (typeof opts.weeks === "number") {
      const ico = iconImg(ICONS.weeks, "Semanas", 16, "opacity:.9;margin-right:6px");
      chips.push(`<div style="display:flex;align-items:center"><span>${ico}<strong style="color:${COLORS.accent}">Semanas:</strong>+&nbsp;${opts.weeks}</span></div>`);
    }
    if (typeof opts.expiresAt === "number") {
      const ico = iconImg(ICONS.expires, "Nuevo venc.", 16, "opacity:.9;margin-right:6px");
      const expires = new Date(opts.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      chips.push(`<div style="display:flex;align-items:center"><span>${ico}<strong style="color:${COLORS.accent}">Nuevo venc.:</strong>&nbsp;${expires}</span></div>`);
    }
    return chips.join("");
  })();

  const inner = infoBlock(opts, extra);
  return layout("Extensión confirmada", intro, inner, opts.appUrl);
}

/* ---- Email para compras de carrito ---- */
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
        <td style="padding:10px 12px">
          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate">
            <tr>
              ${it.coverUrl ? `<td width="56" valign="middle"><img src="${it.coverUrl}" width="56" height="56" style="display:block;border-radius:10px" alt="Cover ${esc(it.title)}" /></td>` : ""}
              <td valign="middle" style="padding-left:${it.coverUrl ? "10" : "0"}px">
                <div style="color:${COLORS.accent};font-weight:800;line-height:1.35">${esc(it.title)}</div>
              </td>
            </tr>
          </table>
        </td>
        <td align="right" style="padding:10px 12px;color:${COLORS.accent};font-weight:900">${money}</td>
      </tr>`;
  }).join("");

  const iconAmount = iconImg(ICONS.amount, "Total", 18, "opacity:.95;margin-right:6px");
  const iconMethod = iconImg(ICONS.method, "Método", 16, "opacity:.9;margin-right:6px");

  const inner = `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate">
        ${rows}
        <tr><td colspan="2" style="height:1px;background:${COLORS.border}"></td></tr>
        <tr>
          <td style="padding:12px;color:${COLORS.accent};font-weight:800">
            ${iconMethod}<span style="vertical-align:middle"><strong style="color:${COLORS.accent}">Método:</strong>&nbsp;${esc(opts.method || "Tarjeta guardada")}</span>
          </td>
          <td align="right" style="padding:12px;color:${COLORS.accent};font-weight:900">
            ${iconAmount}<span style="vertical-align:middle">${total.toLocaleString("en-US", { style: "currency", currency: cur })}</span>
          </td>
        </tr>
      </table>
    </div>
    ${opts.appUrl ? `<div style="margin-top:16px">
      <a href="${opts.appUrl}" style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:800;letter-spacing:.2px">Ver mis juegos</a>
    </div>` : ""}
  `;

  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, confirmamos tu compra de varios ítems en PlayVerse.`;
  return layout("Compra confirmada (Carrito)", intro, inner, opts.appUrl);
}

/* ---- Email de contacto a admin (sin user-agent) ---- */
export function buildContactAdminEmail(opts: {
  name?: string | null;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  appUrl?: string | null;
  createdAt?: number | null;
}) {
  const when = opts.createdAt ? new Date(opts.createdAt).toLocaleString("es-AR") : "";
  const intro = `Recibiste una nueva consulta desde el formulario de PlayVerse.`;
  const inner = `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;padding:16px">
      <div style="color:${COLORS.accent};font-size:16px;font-weight:800;margin-bottom:8px">${esc(opts.subject ?? "Sin asunto")}</div>
      <div style="color:${COLORS.textSoft};white-space:pre-wrap;line-height:1.6">${esc(opts.message ?? "")}</div>
      <div style="margin-top:12px;color:${COLORS.textMuted};font-size:12px;line-height:1.55">
        <div><strong>Nombre:</strong> ${esc(opts.name ?? "—")}</div>
        <div><strong>Email:</strong> ${esc(opts.email ?? "—")}</div>
        ${when ? `<div><strong>Fecha:</strong> ${when}</div>` : ""}
      </div>
    </div>
  `;
  return layout("Nueva consulta — PlayVerse", intro, inner, opts.appUrl);
}

/* ---- Email de acuse para el usuario ---- */
export function buildContactUserEmail(opts: {
  name?: string | null;
  subject?: string | null;
  message?: string | null;
  appUrl?: string | null;
}) {
  const intro = `Hola ${esc(opts.name ?? "jugador/a")}, ¡gracias por contactarte con PlayVerse! Recibimos tu mensaje y te responderemos a la brevedad.`;
  const inner = `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;padding:16px">
      <div style="color:${COLORS.accent};font-size:16px;font-weight:800;margin-bottom:8px">${esc(opts.subject ?? "Tu consulta")}</div>
      <div style="color:${COLORS.textSoft};white-space:pre-wrap;line-height:1.6">${esc(opts.message ?? "")}</div>
      ${opts.appUrl ? `
        <div style="margin-top:16px">
          <a href="${opts.appUrl}" style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:800;letter-spacing:.2px">Ir a PlayVerse</a>
        </div>
      ` : ""}
    </div>
  `;
  return layout("¡Gracias por tu mensaje!", intro, inner, opts.appUrl);
}

export default {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
  buildCartEmail,
  buildContactAdminEmail,
  buildContactUserEmail,
};
