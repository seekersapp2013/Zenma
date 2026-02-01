/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actors from "../actors.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as checkMigrationStatus from "../checkMigrationStatus.js";
import type * as claps from "../claps.js";
import type * as comments from "../comments.js";
import type * as contacts from "../contacts.js";
import type * as content from "../content.js";
import type * as debug from "../debug.js";
import type * as directors from "../directors.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as migrateRatings from "../migrateRatings.js";
import type * as migrations from "../migrations.js";
import type * as migrations_migrateComments from "../migrations/migrateComments.js";
import type * as migrations_migrateReviews from "../migrations/migrateReviews.js";
import type * as pages from "../pages.js";
import type * as ratings from "../ratings.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as runMigration from "../runMigration.js";
import type * as runReviewMigration from "../runReviewMigration.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actors: typeof actors;
  auth: typeof auth;
  categories: typeof categories;
  checkMigrationStatus: typeof checkMigrationStatus;
  claps: typeof claps;
  comments: typeof comments;
  contacts: typeof contacts;
  content: typeof content;
  debug: typeof debug;
  directors: typeof directors;
  files: typeof files;
  http: typeof http;
  items: typeof items;
  migrateRatings: typeof migrateRatings;
  migrations: typeof migrations;
  "migrations/migrateComments": typeof migrations_migrateComments;
  "migrations/migrateReviews": typeof migrations_migrateReviews;
  pages: typeof pages;
  ratings: typeof ratings;
  reviews: typeof reviews;
  router: typeof router;
  runMigration: typeof runMigration;
  runReviewMigration: typeof runReviewMigration;
  search: typeof search;
  seed: typeof seed;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
