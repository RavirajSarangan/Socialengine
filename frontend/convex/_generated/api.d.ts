/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as activities from "../activities.js";
import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as aiInternal from "../aiInternal.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as autoReply from "../autoReply.js";
import type * as billing from "../billing.js";
import type * as crons from "../crons.js";
import type * as generations from "../generations.js";
import type * as http from "../http.js";
import type * as lib_guards from "../lib/guards.js";
import type * as lib_platformMedia from "../lib/platformMedia.js";
import type * as media from "../media.js";
import type * as posts from "../posts.js";
import type * as publish from "../publish.js";
import type * as system from "../system.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  activities: typeof activities;
  admin: typeof admin;
  ai: typeof ai;
  aiInternal: typeof aiInternal;
  analytics: typeof analytics;
  auth: typeof auth;
  autoReply: typeof autoReply;
  billing: typeof billing;
  crons: typeof crons;
  generations: typeof generations;
  http: typeof http;
  "lib/guards": typeof lib_guards;
  "lib/platformMedia": typeof lib_platformMedia;
  media: typeof media;
  posts: typeof posts;
  publish: typeof publish;
  system: typeof system;
  users: typeof users;
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
