// Remove CampaignBanner from Home to remove this seasonal offer entirely.
// Finland has returned to winter time by 26 October (UTC+02:00).
export const CAMPAIGN_END = Date.parse("2026-10-26T00:00:00+02:00");
export const campaignIsActive = (now = Date.now()) => now < CAMPAIGN_END;
