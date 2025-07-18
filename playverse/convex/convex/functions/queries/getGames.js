// convex/convex/functions/queries/getGames.js
import { query } from "../../_generated/server";

export default query(async ({ db }) => {
  const games = await db.query("games").order("desc").collect();
  return games;
});
