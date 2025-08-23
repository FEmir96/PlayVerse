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
import type * as functions_mutations_addGame from "../functions/mutations/addGame.js";
import type * as functions_mutations_addGamesBatch from "../functions/mutations/addGamesBatch.js";
import type * as functions_mutations_createGame from "../functions/mutations/createGame.js";
import type * as functions_mutations_createUser from "../functions/mutations/createUser.js";
import type * as functions_mutations_deleteGame from "../functions/mutations/deleteGame.js";
import type * as functions_mutations_deleteUser from "../functions/mutations/deleteUser.js";
import type * as functions_mutations_makePayment from "../functions/mutations/makePayment.js";
import type * as functions_mutations_promoteToAdmin from "../functions/mutations/promoteToAdmin.js";
import type * as functions_mutations_rentGame from "../functions/mutations/rentGame.js";
import type * as functions_mutations_seed from "../functions/mutations/seed.js";
import type * as functions_mutations_simulateRental from "../functions/mutations/simulateRental.js";
import type * as functions_mutations_updateGame from "../functions/mutations/updateGame.js";
import type * as functions_mutations_updateUser from "../functions/mutations/updateUser.js";
import type * as functions_mutations_upgradePlan from "../functions/mutations/upgradePlan.js";
import type * as functions_queries_getAdmins from "../functions/queries/getAdmins.js";
import type * as functions_queries_getAllUsers from "../functions/queries/getAllUsers.js";
import type * as functions_queries_getAuditLogs from "../functions/queries/getAuditLogs.js";
import type * as functions_queries_getAvailableGames from "../functions/queries/getAvailableGames.js";
import type * as functions_queries_getFreeGames from "../functions/queries/getFreeGames.js";
import type * as functions_queries_getGames from "../functions/queries/getGames.js";
import type * as functions_queries_getPremiumGames from "../functions/queries/getPremiumGames.js";
import type * as functions_queries_getUserByEmail from "../functions/queries/getUserByEmail.js";
import type * as functions_queries_getUserPayments from "../functions/queries/getUserPayments.js";
import type * as functions_queries_getUserRentals from "../functions/queries/getUserRentals.js";
import type * as functions_queries_getUserUpgrades from "../functions/queries/getUserUpgrades.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/mutations/addGame": typeof functions_mutations_addGame;
  "functions/mutations/addGamesBatch": typeof functions_mutations_addGamesBatch;
  "functions/mutations/createGame": typeof functions_mutations_createGame;
  "functions/mutations/createUser": typeof functions_mutations_createUser;
  "functions/mutations/deleteGame": typeof functions_mutations_deleteGame;
  "functions/mutations/deleteUser": typeof functions_mutations_deleteUser;
  "functions/mutations/makePayment": typeof functions_mutations_makePayment;
  "functions/mutations/promoteToAdmin": typeof functions_mutations_promoteToAdmin;
  "functions/mutations/rentGame": typeof functions_mutations_rentGame;
  "functions/mutations/seed": typeof functions_mutations_seed;
  "functions/mutations/simulateRental": typeof functions_mutations_simulateRental;
  "functions/mutations/updateGame": typeof functions_mutations_updateGame;
  "functions/mutations/updateUser": typeof functions_mutations_updateUser;
  "functions/mutations/upgradePlan": typeof functions_mutations_upgradePlan;
  "functions/queries/getAdmins": typeof functions_queries_getAdmins;
  "functions/queries/getAllUsers": typeof functions_queries_getAllUsers;
  "functions/queries/getAuditLogs": typeof functions_queries_getAuditLogs;
  "functions/queries/getAvailableGames": typeof functions_queries_getAvailableGames;
  "functions/queries/getFreeGames": typeof functions_queries_getFreeGames;
  "functions/queries/getGames": typeof functions_queries_getGames;
  "functions/queries/getPremiumGames": typeof functions_queries_getPremiumGames;
  "functions/queries/getUserByEmail": typeof functions_queries_getUserByEmail;
  "functions/queries/getUserPayments": typeof functions_queries_getUserPayments;
  "functions/queries/getUserRentals": typeof functions_queries_getUserRentals;
  "functions/queries/getUserUpgrades": typeof functions_queries_getUserUpgrades;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
