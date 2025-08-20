// convex/functions/queries/getAuditLogs.ts
import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getAuditLogs = query({
  args: {
    requesterId: v.id("profiles"),
    entity: v.optional(v.string()), // ej: "game"
    action: v.optional(v.string()), // ej: "update_game"
  },
  handler: async ({ db }, { requesterId, entity, action }) => {
    // 1. Verificar que requester sea admin
    const requester = await db.get(requesterId);
    if (!requester || requester.role !== "admin") {
      throw new Error("No autorizado. Solo un admin puede consultar auditoría.");
    }

    // 2. Buscar logs en DB
    let logs = await db.query("audits").collect();

    // 3. Aplicar filtros opcionales
    if (entity) logs = logs.filter((log) => log.entity === entity);
    if (action) logs = logs.filter((log) => log.action === action);

    // 4. Ordenar (últimos primero)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    return logs;
  },
});
