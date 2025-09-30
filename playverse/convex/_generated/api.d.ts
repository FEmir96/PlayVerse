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
import type * as actions_ageRatingsNuke from "../actions/ageRatingsNuke.js";
import type * as actions_backfillCoversFromIGDB from "../actions/backfillCoversFromIGDB.js";
import type * as actions_backfillDetailsFromIGDB from "../actions/backfillDetailsFromIGDB.js";
import type * as actions_cleanupNotRated from "../actions/cleanupNotRated.js";
import type * as actions_debugRawgSearch from "../actions/debugRawgSearch.js";
import type * as actions_debugSearchIgdb from "../actions/debugSearchIgdb.js";
import type * as actions_email from "../actions/email.js";
import type * as actions_fillUpcomingCoversFromIGDB from "../actions/fillUpcomingCoversFromIGDB.js";
import type * as actions_getIGDBScreenshots from "../actions/getIGDBScreenshots.js";
import type * as actions_massBackfillAgeRatings from "../actions/massBackfillAgeRatings.js";
import type * as actions_refreshIGDBBatch from "../actions/refreshIGDBBatch.js";
import type * as actions_refreshIGDBRatingForGame from "../actions/refreshIGDBRatingForGame.js";
import type * as actions_refreshRAWGBatch from "../actions/refreshRAWGBatch.js";
import type * as actions_refreshRAWGRatingForGame from "../actions/refreshRAWGRatingForGame.js";
import type * as actions_translateExistingDescriptions from "../actions/translateExistingDescriptions.js";
import type * as auth from "../auth.js";
import type * as lib_emailTemplates from "../lib/emailTemplates.js";
import type * as lib_igdb_ageRatings from "../lib/igdb/ageRatings.js";
import type * as lib_igdb_auth from "../lib/igdb/auth.js";
import type * as lib_igdb_client from "../lib/igdb/client.js";
import type * as lib_igdb_token from "../lib/igdb/token.js";
import type * as lib_rawg_age from "../lib/rawg/age.js";
import type * as lib_rawg_client from "../lib/rawg/client.js";
import type * as mutations_addGame from "../mutations/addGame.js";
import type * as mutations_addGamesBatch from "../mutations/addGamesBatch.js";
import type * as mutations_applyAgeRating from "../mutations/applyAgeRating.js";
import type * as mutations_applyIgdbRating from "../mutations/applyIgdbRating.js";
import type * as mutations_authLogin from "../mutations/authLogin.js";
import type * as mutations_cancelPremiumPlan from "../mutations/cancelPremiumPlan.js";
import type * as mutations_createGame from "../mutations/createGame.js";
import type * as mutations_createUser from "../mutations/createUser.js";
import type * as mutations_deleteGame from "../mutations/deleteGame.js";
import type * as mutations_deletePaymentMethod from "../mutations/deletePaymentMethod.js";
import type * as mutations_deleteUser from "../mutations/deleteUser.js";
import type * as mutations_makePayment from "../mutations/makePayment.js";
import type * as mutations_promoteToAdmin from "../mutations/promoteToAdmin.js";
import type * as mutations_rentGame from "../mutations/rentGame.js";
import type * as mutations_restoreGameTitles from "../mutations/restoreGameTitles.js";
import type * as mutations_savePaymentMethod from "../mutations/savePaymentMethod.js";
import type * as mutations_seed from "../mutations/seed.js";
import type * as mutations_setGameCoverUrl from "../mutations/setGameCoverUrl.js";
import type * as mutations_setGameDetails from "../mutations/setGameDetails.js";
import type * as mutations_setGameTrailerUrl from "../mutations/setGameTrailerUrl.js";
import type * as mutations_simulateRental from "../mutations/simulateRental.js";
import type * as mutations_updateGame from "../mutations/updateGame.js";
import type * as mutations_updateUser from "../mutations/updateUser.js";
import type * as mutations_upgradePlan from "../mutations/upgradePlan.js";
import type * as mutations_upsertUpcoming from "../mutations/upsertUpcoming.js";
import type * as profiles from "../profiles.js";
import type * as queries_getAdmins from "../queries/getAdmins.js";
import type * as queries_getAllUsers from "../queries/getAllUsers.js";
import type * as queries_getAuditLogs from "../queries/getAuditLogs.js";
import type * as queries_getAvailableGames from "../queries/getAvailableGames.js";
import type * as queries_getFeaturedByTitles from "../queries/getFeaturedByTitles.js";
import type * as queries_getFreeGames from "../queries/getFreeGames.js";
import type * as queries_getGameById from "../queries/getGameById.js";
import type * as queries_getGames from "../queries/getGames.js";
import type * as queries_getPaymentMethods from "../queries/getPaymentMethods.js";
import type * as queries_getPremiumGames from "../queries/getPremiumGames.js";
import type * as queries_getUpcomingGames from "../queries/getUpcomingGames.js";
import type * as queries_getUserByEmail from "../queries/getUserByEmail.js";
import type * as queries_getUserById from "../queries/getUserById.js";
import type * as queries_getUserLibrary from "../queries/getUserLibrary.js";
import type * as queries_getUserPayments from "../queries/getUserPayments.js";
import type * as queries_getUserPurchases from "../queries/getUserPurchases.js";
import type * as queries_getUserRentals from "../queries/getUserRentals.js";
import type * as queries_getUserUpgrades from "../queries/getUserUpgrades.js";
import type * as queries_listGamesMinimal from "../queries/listGamesMinimal.js";
import type * as queries_listGamesWithoutCover from "../queries/listGamesWithoutCover.js";
import type * as queries_listGamesWithoutDetails from "../queries/listGamesWithoutDetails.js";
import type * as queries_listGamesWithoutTrailer from "../queries/listGamesWithoutTrailer.js";
import type * as queries_searchGames from "../queries/searchGames.js";
import type * as transactions from "../transactions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/ageRatingsNuke": typeof actions_ageRatingsNuke;
  "actions/backfillCoversFromIGDB": typeof actions_backfillCoversFromIGDB;
  "actions/backfillDetailsFromIGDB": typeof actions_backfillDetailsFromIGDB;
  "actions/cleanupNotRated": typeof actions_cleanupNotRated;
  "actions/debugRawgSearch": typeof actions_debugRawgSearch;
  "actions/debugSearchIgdb": typeof actions_debugSearchIgdb;
  "actions/email": typeof actions_email;
  "actions/fillUpcomingCoversFromIGDB": typeof actions_fillUpcomingCoversFromIGDB;
  "actions/getIGDBScreenshots": typeof actions_getIGDBScreenshots;
  "actions/massBackfillAgeRatings": typeof actions_massBackfillAgeRatings;
  "actions/refreshIGDBBatch": typeof actions_refreshIGDBBatch;
  "actions/refreshIGDBRatingForGame": typeof actions_refreshIGDBRatingForGame;
  "actions/refreshRAWGBatch": typeof actions_refreshRAWGBatch;
  "actions/refreshRAWGRatingForGame": typeof actions_refreshRAWGRatingForGame;
  "actions/translateExistingDescriptions": typeof actions_translateExistingDescriptions;
  auth: typeof auth;
  "lib/emailTemplates": typeof lib_emailTemplates;
  "lib/igdb/ageRatings": typeof lib_igdb_ageRatings;
  "lib/igdb/auth": typeof lib_igdb_auth;
  "lib/igdb/client": typeof lib_igdb_client;
  "lib/igdb/token": typeof lib_igdb_token;
  "lib/rawg/age": typeof lib_rawg_age;
  "lib/rawg/client": typeof lib_rawg_client;
  "mutations/addGame": typeof mutations_addGame;
  "mutations/addGamesBatch": typeof mutations_addGamesBatch;
  "mutations/applyAgeRating": typeof mutations_applyAgeRating;
  "mutations/applyIgdbRating": typeof mutations_applyIgdbRating;
  "mutations/authLogin": typeof mutations_authLogin;
  "mutations/cancelPremiumPlan": typeof mutations_cancelPremiumPlan;
  "mutations/createGame": typeof mutations_createGame;
  "mutations/createUser": typeof mutations_createUser;
  "mutations/deleteGame": typeof mutations_deleteGame;
  "mutations/deletePaymentMethod": typeof mutations_deletePaymentMethod;
  "mutations/deleteUser": typeof mutations_deleteUser;
  "mutations/makePayment": typeof mutations_makePayment;
  "mutations/promoteToAdmin": typeof mutations_promoteToAdmin;
  "mutations/rentGame": typeof mutations_rentGame;
  "mutations/restoreGameTitles": typeof mutations_restoreGameTitles;
  "mutations/savePaymentMethod": typeof mutations_savePaymentMethod;
  "mutations/seed": typeof mutations_seed;
  "mutations/setGameCoverUrl": typeof mutations_setGameCoverUrl;
  "mutations/setGameDetails": typeof mutations_setGameDetails;
  "mutations/setGameTrailerUrl": typeof mutations_setGameTrailerUrl;
  "mutations/simulateRental": typeof mutations_simulateRental;
  "mutations/updateGame": typeof mutations_updateGame;
  "mutations/updateUser": typeof mutations_updateUser;
  "mutations/upgradePlan": typeof mutations_upgradePlan;
  "mutations/upsertUpcoming": typeof mutations_upsertUpcoming;
  profiles: typeof profiles;
  "queries/getAdmins": typeof queries_getAdmins;
  "queries/getAllUsers": typeof queries_getAllUsers;
  "queries/getAuditLogs": typeof queries_getAuditLogs;
  "queries/getAvailableGames": typeof queries_getAvailableGames;
  "queries/getFeaturedByTitles": typeof queries_getFeaturedByTitles;
  "queries/getFreeGames": typeof queries_getFreeGames;
  "queries/getGameById": typeof queries_getGameById;
  "queries/getGames": typeof queries_getGames;
  "queries/getPaymentMethods": typeof queries_getPaymentMethods;
  "queries/getPremiumGames": typeof queries_getPremiumGames;
  "queries/getUpcomingGames": typeof queries_getUpcomingGames;
  "queries/getUserByEmail": typeof queries_getUserByEmail;
  "queries/getUserById": typeof queries_getUserById;
  "queries/getUserLibrary": typeof queries_getUserLibrary;
  "queries/getUserPayments": typeof queries_getUserPayments;
  "queries/getUserPurchases": typeof queries_getUserPurchases;
  "queries/getUserRentals": typeof queries_getUserRentals;
  "queries/getUserUpgrades": typeof queries_getUserUpgrades;
  "queries/listGamesMinimal": typeof queries_listGamesMinimal;
  "queries/listGamesWithoutCover": typeof queries_listGamesWithoutCover;
  "queries/listGamesWithoutDetails": typeof queries_listGamesWithoutDetails;
  "queries/listGamesWithoutTrailer": typeof queries_listGamesWithoutTrailer;
  "queries/searchGames": typeof queries_searchGames;
  transactions: typeof transactions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
