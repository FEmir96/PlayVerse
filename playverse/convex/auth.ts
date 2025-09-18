// convex/auth.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

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

    // 👇 versión síncrona (NO usa timers)
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

    // 👇 versión síncrona
    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) return { ok: false, error: "Credenciales inválidas" } as const;

    const { _id, name, role, createdAt } = user;
    return {
      ok: true,
      profile: { _id, name, email: user.email, role, createdAt },
    } as const;
  },
});
