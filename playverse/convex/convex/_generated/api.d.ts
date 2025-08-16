/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_mutations_createGame from "../functions/mutations/createGame.js";
import type * as functions_mutations_createUser from "../functions/mutations/createUser.js";
import type * as functions_mutations_deleteGame from "../functions/mutations/deleteGame.js";
import type * as functions_mutations_seed from "../functions/mutations/seed.js";
import type * as functions_mutations_simulateRental from "../functions/mutations/simulateRental.js";
import type * as functions_mutations_updateGame from "../functions/mutations/updateGame.js";
import type * as functions_queries_getFreeGames from "../functions/queries/getFreeGames.js";
import type * as functions_queries_getGames from "../functions/queries/getGames.js";
import type * as functions_queries_getPremiumGames from "../functions/queries/getPremiumGames.js";
import type * as functions_queries_getUserByEmail from "../functions/queries/getUserByEmail.js";
import type * as functions_queries_getUserRentals from "../functions/queries/getUserRentals.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/mutations/createGame": typeof functions_mutations_createGame;
  "functions/mutations/createUser": typeof functions_mutations_createUser;
  "functions/mutations/deleteGame": typeof functions_mutations_deleteGame;
  "functions/mutations/seed": typeof functions_mutations_seed;
  "functions/mutations/simulateRental": typeof functions_mutations_simulateRental;
  "functions/mutations/updateGame": typeof functions_mutations_updateGame;
  "functions/queries/getFreeGames": typeof functions_queries_getFreeGames;
  "functions/queries/getGames": typeof functions_queries_getGames;
  "functions/queries/getPremiumGames": typeof functions_queries_getPremiumGames;
  "functions/queries/getUserByEmail": typeof functions_queries_getUserByEmail;
  "functions/queries/getUserRentals": typeof functions_queries_getUserRentals;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
