import { siteSettings } from "@/data/siteSettings";
import type { SiteSettings } from "@/types/site";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.siteSettings";

export function getSiteSettings() {
  return readStorage<SiteSettings>(KEY, siteSettings);
}

export function saveSiteSettings(settings: SiteSettings) {
  writeStorage(KEY, settings);
  return settings;
}
