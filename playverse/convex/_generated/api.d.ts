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
import type * as auth from "../auth.js";
import type * as mutations_addGame from "../mutations/addGame.js";
import type * as mutations_addGamesBatch from "../mutations/addGamesBatch.js";
import type * as mutations_authLogin from "../mutations/authLogin.js";
import type * as mutations_createGame from "../mutations/createGame.js";
import type * as mutations_createUser from "../mutations/createUser.js";
import type * as mutations_deleteGame from "../mutations/deleteGame.js";
import type * as mutations_deleteUser from "../mutations/deleteUser.js";
import type * as mutations_makePayment from "../mutations/makePayment.js";
import type * as mutations_promoteToAdmin from "../mutations/promoteToAdmin.js";
import type * as mutations_rentGame from "../mutations/rentGame.js";
import type * as mutations_seed from "../mutations/seed.js";
import type * as mutations_simulateRental from "../mutations/simulateRental.js";
import type * as mutations_updateGame from "../mutations/updateGame.js";
import type * as mutations_updateUser from "../mutations/updateUser.js";
import type * as mutations_upgradePlan from "../mutations/upgradePlan.js";
import type * as profiles from "../profiles.js";
import type * as queries_getAdmins from "../queries/getAdmins.js";
import type * as queries_getAllUsers from "../queries/getAllUsers.js";
import type * as queries_getAuditLogs from "../queries/getAuditLogs.js";
import type * as queries_getAvailableGames from "../queries/getAvailableGames.js";
import type * as queries_getFreeGames from "../queries/getFreeGames.js";
import type * as queries_getGames from "../queries/getGames.js";
import type * as queries_getPremiumGames from "../queries/getPremiumGames.js";
import type * as queries_getUserPayments from "../queries/getUserPayments.js";
import type * as queries_getUserRentals from "../queries/getUserRentals.js";
import type * as queries_getUserUpgrades from "../queries/getUserUpgrades.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "mutations/addGame": typeof mutations_addGame;
  "mutations/addGamesBatch": typeof mutations_addGamesBatch;
  "mutations/authLogin": typeof mutations_authLogin;
  "mutations/createGame": typeof mutations_createGame;
  "mutations/createUser": typeof mutations_createUser;
  "mutations/deleteGame": typeof mutations_deleteGame;
  "mutations/deleteUser": typeof mutations_deleteUser;
  "mutations/makePayment": typeof mutations_makePayment;
  "mutations/promoteToAdmin": typeof mutations_promoteToAdmin;
  "mutations/rentGame": typeof mutations_rentGame;
  "mutations/seed": typeof mutations_seed;
  "mutations/simulateRental": typeof mutations_simulateRental;
  "mutations/updateGame": typeof mutations_updateGame;
  "mutations/updateUser": typeof mutations_updateUser;
  "mutations/upgradePlan": typeof mutations_upgradePlan;
  profiles: typeof profiles;
  "queries/getAdmins": typeof queries_getAdmins;
  "queries/getAllUsers": typeof queries_getAllUsers;
  "queries/getAuditLogs": typeof queries_getAuditLogs;
  "queries/getAvailableGames": typeof queries_getAvailableGames;
  "queries/getFreeGames": typeof queries_getFreeGames;
  "queries/getGames": typeof queries_getGames;
  "queries/getPremiumGames": typeof queries_getPremiumGames;
  "queries/getUserPayments": typeof queries_getUserPayments;
  "queries/getUserRentals": typeof queries_getUserRentals;
  "queries/getUserUpgrades": typeof queries_getUserUpgrades;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
