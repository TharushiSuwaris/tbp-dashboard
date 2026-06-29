import type { DiscoverySearchParams, Prospect } from "@/types";
import { mockProspects } from "@/lib/mock-data/prospects";

/**
 * Mock prospect discovery function.
 * In production, replace this with calls to Tavily, Brave Search, SerpAPI
 * or approved internal databases.
 */
export async function runProspectDiscovery(params: DiscoverySearchParams): Promise<Prospect[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  let results = [...mockProspects];

  if (params.region) {
    results = results.filter((p) =>
      p.region.toLowerCase().includes(params.region!.toLowerCase())
    );
  }

  if (params.country) {
    results = results.filter((p) =>
      p.country.toLowerCase().includes(params.country!.toLowerCase())
    );
  }

  if (params.city) {
    results = results.filter((p) =>
      p.city.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  if (params.prospectCategory) {
    results = results.filter((p) =>
      p.prospect_type.toLowerCase().includes(params.prospectCategory!.toLowerCase().replace(/\s+/g, "-"))
    );
  }

  if (params.sectorFocus) {
    results = results.filter((p) =>
      p.sector_interests.some((s) =>
        s.toLowerCase().includes(params.sectorFocus!.toLowerCase())
      )
    );
  }

  if (params.minimumSuitabilityScore) {
    results = results.filter(
      (p) => p.suitability_score >= params.minimumSuitabilityScore!
    );
  }

  return results;
}
