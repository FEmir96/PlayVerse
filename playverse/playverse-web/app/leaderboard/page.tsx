"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { FunctionReference } from "convex/server";

type GameKey = "snake" | "pulse-riders";

const GAME_META: Record<GameKey, { title: string; embedUrl: string }> = {
  snake:          { title: "Snake (Freeware)", embedUrl: "/static-games/snake" },
  "pulse-riders": { title: "Pulse Riders",     embedUrl: "/static-games/pulse-riders" },
};

// ✅ Query: top de scores
const topByGameRef = (
  (api as any)["queries/scores/topByGame"] as {
    topByGame: FunctionReference<"query">;
  }
).topByGame;

// ✅ Query: resolver id del juego por embedUrl (para armar /play/[id])
const getIdByEmbedUrlRef = (
  (api as any)["queries/games/getIdByEmbedUrl"] as {
    getIdByEmbedUrl: FunctionReference<"query">;
  }
).getIdByEmbedUrl;

export default function LeaderboardPage() {
  const params = useSearchParams();
  const router = useRouter();

  const gameParam = params.get("game");
  const selected: GameKey = gameParam === "pulse-riders" ? "pulse-riders" : "snake";
  const meta = GAME_META[selected];

  // Datos del top
  const rows = useQuery(
    topByGameRef as any,
    { embedUrl: meta.embedUrl, limit: 25 } as any
  ) as Array<{
    _id: string;
    userName: string;
    userEmail: string;
    score: number;
    updatedAt?: number;
  }> | undefined;

  // 🔎 Resolver /play/[id] del juego seleccionado
  const selectedInfo = useQuery(
    getIdByEmbedUrlRef as any,
    { embedUrl: meta.embedUrl } as any
  ) as { id: string; title: string; embedUrl: string } | null | undefined;

  // 🔎 También resolvemos los dos ids para los “enlaces directos”
  const snakeInfo = useQuery(
    getIdByEmbedUrlRef as any,
    { embedUrl: GAME_META.snake.embedUrl } as any
  ) as { id: string } | null | undefined;

  const prInfo = useQuery(
    getIdByEmbedUrlRef as any,
    { embedUrl: GAME_META["pulse-riders"].embedUrl } as any
  ) as { id: string } | null | undefined;

  const playHrefSelected = selectedInfo?.id ? `/play/${selectedInfo.id}` : undefined;
  const playHrefSnake = snakeInfo?.id ? `/play/${snakeInfo.id}` : undefined;
  const playHrefPR = prInfo?.id ? `/play/${prInfo.id}` : undefined;

  const when = (t?: number) => (t ? new Date(t).toLocaleString() : "-");

  const Tab = ({ k, children }: { k: GameKey; children: React.ReactNode }) => {
    const active = selected === k;
    return (
      <button
        onClick={() => router.push(`/leaderboard?game=${k}`)}
        className={`px-4 py-2 rounded-full border transition ${
          active
            ? "bg-cyan-500 text-slate-900 border-cyan-300"
            : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-12">
        {/* Título + CTA */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 drop-shadow-sm">
            Leaderboard
          </h1>

          {/* 👉 Ahora lleva a /play/[id] del juego seleccionado (cuando esté resuelto) */}
          {playHrefSelected ? (
            <Link
              href={playHrefSelected}
              className="inline-flex items-center rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-4 py-2 shadow ring-1 ring-amber-300/40 transition"
            >
              Jugar {meta.title}
            </Link>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-700 text-slate-300 px-4 py-2 text-sm">
              Resolviendo acceso…
            </span>
          )}
        </div>

        {/* Tabs de juego */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Tab k="snake">Snake (Freeware)</Tab>
          <Tab k="pulse-riders">Pulse Riders</Tab>

          {/* Muestra del destino al costado */}
          <span className="ml-2 text-xs text-slate-400 hidden sm:inline">
            {playHrefSelected ? playHrefSelected : meta.embedUrl}
          </span>
          <span className="ml-auto text-xs text-slate-400">
            Fuente: Convex · query <code>scores/topByGame</code>
          </span>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
          <div className="px-4 py-3 text-amber-300 font-semibold border-b border-slate-700">
            Top 25 — {meta.title}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/70 text-slate-300">
                <tr>
                  <th className="px-4 py-2 text-left w-12">#</th>
                  <th className="px-4 py-2 text-left">Jugador</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r, i) => (
                  <tr key={r._id} className="border-t border-slate-700/60">
                    <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2">{r.userName}</td>
                    <td className="px-4 py-2 text-slate-300">{r.userEmail}</td>
                    <td className="px-4 py-2 font-semibold text-cyan-300">{r.score}</td>
                    <td className="px-4 py-2 text-slate-400">{when(r.updatedAt)}</td>
                  </tr>
                ))}
                {(!rows || rows.length === 0) && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={5}>
                      Sin registros todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enlaces directos → ahora a /play/[id] */}
          <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-700/60">
            Enlaces directos:&nbsp;
            {playHrefSnake ? (
              <Link
                href={playHrefSnake}
                className="underline decoration-slate-600 hover:text-slate-300"
              >
                {playHrefSnake}
              </Link>
            ) : (
              <span className="opacity-60">/play/[id] (Snake)</span>
            )}
            &nbsp;·&nbsp;
            {playHrefPR ? (
              <Link
                href={playHrefPR}
                className="underline decoration-slate-600 hover:text-slate-300"
              >
                {playHrefPR}
              </Link>
            ) : (
              <span className="opacity-60">/play/[id] (Pulse Riders)</span>
            )}
            &nbsp;· Tamaño: &amp;limit=25.
          </div>
        </div>
      </div>
    </main>
  );
}
