// convex/functions/mutations/createUser.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("admin")
    ),
  },
  handler: async ({ db }, { name, email, role }) => {
    const now = Date.now();

    // Validar si ya existe un usuario con ese email
    const existing = await db
      .query("profiles")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("El email ya está registrado.");
    }

    // Crear el usuario
    const userId = await db.insert("profiles", {
      name,
      email,
      role,
      createdAt: now,
    });

    // Crear auditoría
    await db.insert("audits", {
      action: "create_user",
      entity: "user",
      entityId: userId,            // ahora soporta profiles o games según lo que definimos
      requesterId: userId,         // en este caso, el propio usuario creado
      timestamp: now,
      details: { name, email, role },
    });

    return userId;
  },
});
