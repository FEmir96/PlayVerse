"use node";
// convex/actions/cleanupNotRated.ts
import { action } from "../_generated/server";

type CleanResult = { changed: number; scanned: number };

export const cleanupNotRated = action({
  args: {},
  handler: async (ctx): Promise<CleanResult> => {
    const api: any = (await import("../_generated/api")).api;

    const list = (await ctx.runQuery(
      api.queries.listGamesMinimal.listGamesMinimal,
      {}
    )) as Array<{ _id: string; ageRatingLabel?: string | null }>;

    const targets = list.filter(
      (g) => g.ageRatingLabel === "Not Rated" || g.ageRatingLabel === "NR"
    );

    let changed = 0;
    for (const g of targets) {
      await ctx.runMutation(api.mutations.applyIgdbRating.applyIgdbRating, {
        id: g._id as any,
        requesterId: undefined,
        data: {
          ageRatingLabel: undefined,
          ageRatingSystem: undefined,
        } as any,
        auditDetails: { cleanup: true },
      });
      changed++;
      await sleep(10);
    }
    return { changed, scanned: list.length };
  },
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
