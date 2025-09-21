// convex/auth.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
// --- 👇 NUEVO: actualizar perfil (nombre, password y/o avatar) ---
import { Id } from "./_generated/dataModel"; // si ya lo importaste arriba, podés omitir esta línea

export const updateProfile = mutation({
  args: {
    userId: v.id("profiles"),
    name: v.optional(v.string()),
    newPassword: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async ({ db }, { userId, name, newPassword, avatarUrl }) => {
    const current = await db.get(userId as Id<"profiles">);
    if (!current) {
      throw new Error("Perfil no encontrado");
    }

    const patch: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim() && name !== current.name) {
      patch.name = name.trim();
    }
    if (typeof avatarUrl === "string" && avatarUrl !== (current as any).avatarUrl) {
      patch.avatarUrl = avatarUrl;
    }
    if (typeof newPassword === "string" && newPassword.length > 0) {
      // usa el mismo bcrypt ya importado en este archivo
      patch.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    if (Object.keys(patch).length > 0) {
      await db.patch(current._id, patch);
    }

    return { ok: true } as const;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
  },
  handler: async ({ db }, { name, email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const exists = await db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();
    if (exists) {
      return { ok: false, error: "El email ya está registrado" } as const;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const now = Date.now();
    const _id = await db.insert("profiles", {
      name,
      email: normalizedEmail,
      role,
      createdAt: now,
      passwordHash,
    });

    return {
      ok: true,
      profile: { _id, name, email: normalizedEmail, role, createdAt: now },
    } as const;
  },
});

export const authLogin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async ({ db }, { email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) return { ok: false, error: "Usuario no encontrado" } as const;

    if (!user.passwordHash) {
      return {
        ok: false,
        error:
          "La cuenta no tiene contraseña configurada. Registrate nuevamente o reseteá tu contraseña.",
      } as const;
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) return { ok: false, error: "Credenciales inválidas" } as const;

    const { _id, name, role, createdAt } = user;
    return {
      ok: true,
      profile: { _id, name, email: user.email, role, createdAt },
    } as const;
  },
});

/**
 * 🔐 Usado por NextAuth (Google OAuth):
 * - upsert por email
 * - actualiza name / avatar si llegan
 */
// 👇 Reemplaza SOLO esta función en convex/auth.ts
export const oauthUpsert = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    provider: v.string(),           // "google"
    providerId: v.optional(v.string()),
  },
  handler: async ({ db }, args) => {
    const email = args.email.toLowerCase();

    const existing = await db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    // ⚡ Si no existe -> crear y setear avatarUrl inicial (si viene)
    if (!existing) {
      const _id = await db.insert("profiles", {
        name: args.name ?? "",
        email,
        role: "free",
        createdAt: Date.now(),
        passwordHash: undefined, // opcional en tu schema
        avatarUrl: args.avatarUrl, // solo al crear
      });
      return { created: true, _id };
    }

    // ⚡ Si existe -> NO sobreescribimos avatarUrl si el usuario ya tiene uno.
    //    - Actualizamos name si cambió
    //    - Solo seteamos avatarUrl si hoy NO tiene ninguno
    const patch: Record<string, unknown> = {};
    if (args.name && args.name !== existing.name) patch.name = args.name;

    const hasAvatar = Boolean((existing as any).avatarUrl && String((existing as any).avatarUrl).trim() !== "");
    if (!hasAvatar && args.avatarUrl) {
      patch.avatarUrl = args.avatarUrl;
    }

    if (Object.keys(patch).length) {
      await db.patch(existing._id, patch);
    }

    return { created: false, _id: existing._id };
  },
});
