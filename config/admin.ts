import type { AdminConfig } from "@/types";
import { adConfig } from "@/config/ads";
import { PLAYLIST_URL } from "@/config/site";

/**
 * Static admin defaults. This file is the single place an admin panel would
 * eventually write to (via the service layer, e.g. a Supabase table).
 * Nothing here is persisted server-side; editing it requires a redeploy.
 */
export const defaultAdminConfig: AdminConfig = {
  playlistUrl: PLAYLIST_URL,
  featuredChannelIds: [],
  disabledChannelIds: [],
  channelOrder: [],
  categoryOrder: ["news", "entertainment", "sports", "movies", "kids", "music", "religious", "other"],
  disabledCategories: [],
  ads: adConfig,
};
