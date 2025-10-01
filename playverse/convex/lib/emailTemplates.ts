// convex/lib/emailTemplates.ts

/** Opciones comunes para armar el HTML del mail */
export type BaseOpts = {
  userName?: string | null;
  gameTitle: string;
  coverUrl?: string | null;
  /** Monto en la moneda indicada (default USD) */
  amount: number;
  currency?: string;        // p.ej. "USD"
  /** Texto del método, p.ej. "AMEX •••• 4542" */
  method?: string;
  /** ID de orden si tenés (opcional) */
  orderId?: string | null;
  /** URL de tu app para el CTA */
  appUrl?: string | null;

  /** Solo alquiler / extensión */
  weeks?: number;
  /** Epoch ms del vencimiento (alquiler/extensión) */
  expiresAt?: number;
};

const COLORS = {
  bgOuter:   "#0b1220", // fondo de la página
  cardBg:    "#0f172a", // tarjeta
  border:    "#1f2937",
  brand:     "#fb923c", // naranja principal
  accent:    "#fbbf24", // dorado
  text:      "#e5e7eb",
  textSoft:  "#cbd5e1",
  textMuted: "#94a3b8",
  footer:    "#64748b",
};

/* -------- helpers -------- */

function esc(s: string) {
  return s.replace(/[<>&"]/g, (c) => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!
  ));
}

function cover(url?: string | null, alt?: string) {
  if (!url) return "";
  return `
    <img
      src="${url}"
      alt="${esc(alt || "Cover")}"
      style="
        width:100%;
        max-width:560px;
        height:auto;
        border-radius:12px;
        display:block;
        outline:none;
        text-decoration:none;
        margin:8px 0 6px 0;
        object-fit:cover;
      "
    />
  `;
}

function layout(title: string, intro: string, inner: string) {
  return `<!doctype html>
<html>
  <body style="background:${COLORS.bgOuter};margin:0;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:${COLORS.text}">
    <div style="max-width:680px;margin:0 auto;background:${COLORS.cardBg};border:1px solid ${COLORS.border};border-radius:16px;padding:20px">
      <h1 style="color:${COLORS.brand};margin:0 0 8px 0;font-size:22px;">${title}</h1>
      <p style="color:${COLORS.textSoft};margin:0 0 16px 0;font-size:14px">${intro}</p>

      ${inner}
    </div>

    <p style="text-align:center;color:${COLORS.footer};font-size:12px;margin-top:12px">
      © ${new Date().getFullYear()} PlayVerse
    </p>
  </body>
</html>`;
}

/** Bloque principal con cover + fila: Monto (izq) / Método (der) */
function infoBlock(opts: BaseOpts, extraRows = "") {
  const money  = opts.amount.toLocaleString("en-US", { style: "currency", currency: opts.currency ?? "USD" });
  const method = opts.method ?? "Tarjeta";
  const order  = opts.orderId ? `<div style="margin-top:6px"><strong>ID de pedido:</strong> ${esc(opts.orderId)}</div>` : "";
  const cta    = opts.appUrl
    ? `<div style="margin-top:16px">
         <a href="${opts.appUrl}"
            style="display:inline-block;background:${COLORS.brand};color:#0b0f19;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">
           Ir a PlayVerse
         </a>
       </div>`
    : "";

  return `
    <div style="background:${COLORS.bgOuter};border:1px solid ${COLORS.border};border-radius:12px;padding:16px">
      <h2 style="color:#fff;margin:0 0 8px 0;font-size:18px">${esc(opts.gameTitle)}</h2>
      ${cover(opts.coverUrl, opts.gameTitle)}

      <!-- fila principal: monto (izq) / método (der) -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;color:${COLORS.textSoft};font-size:14px">
        <tr>
          <td align="left"  style="width:50%;padding:6px 0">
            <strong>Monto:</strong>
            <span style="color:${COLORS.accent};font-weight:700">${money}</span>
          </td>
          <td align="right" style="width:50%;padding:6px 0">
            <strong>Método:</strong> ${esc(method)}
          </td>
        </tr>
        ${
          extraRows
            ? `<tr>
                 <td colspan="2" style="padding-top:6px">
                   <div style="display:flex;gap:12px;flex-wrap:wrap;color:${COLORS.textSoft};font-size:14px">${extraRows}</div>
                 </td>
               </tr>`
            : ""
        }
      </table>

      ${order}
      ${cta}
    </div>`;
}

/* -------- builders públicos -------- */

export function buildPurchaseEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, gracias por tu compra en PlayVerse.`;
  const inner = infoBlock(opts);
  return layout("Compra confirmada", intro, inner);
}

export function buildRentalEmail(opts: BaseOpts) {
  const intro = `Hola ${esc(opts.userName ?? "jugador/a")}, tu alquiler fue confirmado.`;
  const extra = (() => {
    const chips: string[] = [];
    if (typeof opts.weeks === "number") {
      chips.push(`<div><strong>Semanas:</strong> ${opts.weeks}</div>`);
    }
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
    if (typeof opts.weeks === "number") {
      chips.push(`<div><strong>Semanas +:</strong> ${opts.weeks}</div>`);
    }
    if (typeof opts.expiresAt === "number") {
      const expires = new Date(opts.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      chips.push(`<div><strong>Nuevo venc.:</strong> ${expires}</div>`);
    }
    return chips.join("");
  })();

  const inner = infoBlock(opts, extra);
  return layout("Extensión confirmada", intro, inner);
}

// (Opcional) export default por si querés importar todo junto
export default {
  buildPurchaseEmail,
  buildRentalEmail,
  buildExtendEmail,
};
