// The shapes of the data files. Don't change these without checking in
// first — the actions data (added in a later step) will depend on them.

export type Condition =
  | "any"
  | "heat-high"
  | "heat-extreme"
  | "cold-extreme"
  | "air-moderate"
  | "air-high"
  | "rain-heavy"
  | "flood-risk";

export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  tagline: string;
  /** UK postcode, used only by the carbon intensity feed. Omit for a city outside the UK. */
  postcode?: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface Verification {
  status: "verified" | "flagged";
  lastChecked: string; // YYYY-MM-DD
  method: string;
  flag_reason?: string;
}

export interface Action {
  id: string;
  city: string;
  category: string;
  title: string;
  summary: string;
  details: string[];
  /** Which live conditions this action is relevant to. "any" shows always. */
  when: Condition[];
  sources: Source[];
  verification: Verification;
}
