import type { AdminConfig } from "@/types";
import { defaultAdminConfig } from "@/config/admin";

/**
 * AdminService — interface the UI depends on. Today: static defaults.
 * Later: implement `SupabaseAdminService` (tables: settings, channels_override,
 * ad_slots) and swap it in `getAdminService()`. The UI does not change.
 *
 * NOTE: writes are intentionally NOT implemented — there is no server persistence yet.
 */
export interface AdminService {
  readonly source: "static-defaults" | "remote";
  getConfig(): Promise<AdminConfig>;
}

class StaticAdminService implements AdminService {
  readonly source = "static-defaults" as const;
  async getConfig(): Promise<AdminConfig> {
    return defaultAdminConfig;
  }
}

let instance: AdminService | null = null;
export function getAdminService(): AdminService {
  if (!instance) instance = new StaticAdminService();
  return instance;
}
