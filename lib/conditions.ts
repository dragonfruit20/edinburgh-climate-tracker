// Turns raw readings into the three panels shown on the homepage, and
// into "conditions" that a later step will match actions against.
// Thresholds are deliberately simple and documented here so you can
// tune them for Edinburgh's climate later if you want.

import type { AirReading, CarbonForecastPeriod, CarbonReading, FloodReading, WeatherReading } from "./feeds";
import type { City, Condition } from "./types";

export type Level = "good" | "moderate" | "high" | "extreme" | "unknown";

export interface Panel {
  key: "heat" | "air" | "rain";
  label: string;
  value: string; // big number
  unit: string;
  level: Level;
  headline: string; // short plain-language read
  detail: string; // one line of context
  conditions: Condition[]; // active conditions this reading triggers
  observedAt: string | null;
  note?: string; // e.g. setup instructions when a feed is missing
}

// Heat: "feels like" temperature in °C. WHO/most public-health services
// start advising caution around 30, warnings around 35.
export function heatPanel(w: WeatherReading | null): Panel {
  if (!w) return unavailable("heat", "Heat", "Feels-like temperature unavailable right now.");
  const t = Math.max(w.feelsLike, w.feelsLikeMaxToday);
  const shown = w.feelsLike;
  let level: Level = "good";
  let headline = "Comfortable";
  let conditions: Condition[] = [];
  if (t >= 40) {
    level = "extreme";
    headline = "Extreme heat";
    conditions = ["heat-extreme", "heat-high"];
  } else if (t >= 35) {
    level = "high";
    headline = "Heat warning territory";
    conditions = ["heat-high"];
  } else if (t >= 30) {
    level = "moderate";
    headline = "Hot";
    conditions = ["heat-high"];
  } else if (shown <= -15) {
    level = "high";
    headline = "Extreme cold";
    conditions = ["cold-extreme"];
  }
  return {
    key: "heat",
    label: "Heat",
    value: formatNum(shown),
    unit: "°C feels like",
    level,
    headline,
    detail: `Actual ${formatNum(w.temperature)}°C. Today's peak feels like ${formatNum(w.feelsLikeMaxToday)}°C.`,
    conditions,
    observedAt: w.time,
  };
}

// Air: US AQI bands. 0–50 good, 51–100 moderate, 101–150 unhealthy for
// sensitive groups, 151+ unhealthy.
export function airPanel(a: AirReading | null): Panel {
  if (!a) return unavailable("air", "Air", "Air quality unavailable right now.");
  let level: Level = "good";
  let headline = "Good";
  let conditions: Condition[] = [];
  if (a.usAqi > 150) {
    level = "extreme";
    headline = "Unhealthy";
    conditions = ["air-high", "air-moderate"];
  } else if (a.usAqi > 100) {
    level = "high";
    headline = "Unhealthy for sensitive groups";
    conditions = ["air-high", "air-moderate"];
  } else if (a.usAqi > 50) {
    level = "moderate";
    headline = "Moderate";
    conditions = ["air-moderate"];
  }
  return {
    key: "air",
    label: "Air",
    value: String(a.usAqi),
    unit: "US AQI",
    level,
    headline,
    detail: `PM2.5 at ${formatNum(a.pm25)} µg/m³.`,
    conditions,
    observedAt: a.time,
  };
}

// Rain and flood. Rain is today's forecast total in mm: above 4mm and
// up to 24mm is "Light rain", 25+ is a heavy day in most climates, 50+
// is the kind of day that floods basements. Flood risk uses river
// discharge vs the long-term mean for this date: 2x is well above
// normal, 5x is flood territory. Adjust for your city.
export function rainPanel(w: WeatherReading | null, f: FloodReading | null): Panel {
  if (!w && !f) return unavailable("rain", "Rain and flood", "Rain and river data unavailable right now.");
  const mm = w?.rainTodayMm ?? 0;
  const ratio = f && f.dischargeMean > 0 ? f.discharge / f.dischargeMean : null;
  let level: Level = "good";
  let headline = "Dry";
  const conditions: Condition[] = [];
  if (mm >= 50 || (ratio !== null && ratio >= 5)) {
    level = "extreme";
    headline = ratio !== null && ratio >= 5 ? "River far above normal" : "Very heavy rain";
    conditions.push("rain-heavy", "flood-risk");
  } else if (mm >= 25 || (ratio !== null && ratio >= 2)) {
    level = "high";
    headline = ratio !== null && ratio >= 2 ? "River above normal" : "Heavy rain";
    conditions.push("rain-heavy", "flood-risk");
  } else if (mm > 4) {
    level = "moderate";
    headline = "Light rain";
    conditions.push("rain-heavy");
  }
  const chance = w?.rainChanceMax != null ? ` ${w.rainChanceMax}% chance of rain.` : "";
  const river = ratio !== null ? ` River flow ${ratio.toFixed(1)}× the normal for today.` : " River data unavailable.";
  return {
    key: "rain",
    label: "Rain and flood",
    value: formatNum(mm),
    unit: "mm today",
    level,
    headline,
    detail: `Forecast total for today.${chance}${river}`,
    conditions,
    observedAt: w?.time ?? (f ? f.date : null),
  };
}

export interface CarbonPanelData {
  label: string;
  value: string;
  unit: string;
  level: Level;
  headline: string;
  /** Plain-language read of carbon intensity, shown once above the panel. */
  explainer: string;
  mix: { fuel: string; percent: number }[];
  cleanest: string | null;
  observedAt: string | null;
  note?: string;
}

// Carbon intensity: grams of CO2 released per kWh of electricity used,
// from the National Energy System Operator's live and forecast feeds.
// "very low"/"low" read as green here, "moderate" amber, "high"/"very
// high" red — the same four-level language as the other panels, even
// though the API itself has five bands.
const CARBON_LEVEL: Record<string, Level> = {
  "very low": "good",
  low: "good",
  moderate: "moderate",
  high: "high",
  "very high": "extreme",
};

const FUEL_LABELS: Record<string, string> = {
  biomass: "Biomass",
  coal: "Coal",
  imports: "Imports",
  gas: "Gas",
  nuclear: "Nuclear",
  other: "Other",
  hydro: "Hydro",
  solar: "Solar",
  wind: "Wind",
};

export function carbonPanel(
  reading: CarbonReading | null,
  forecast: CarbonForecastPeriod[] | null,
  city: City
): CarbonPanelData {
  const explainer = "How much CO2 is released for each unit of electricity used.";
  if (!reading) {
    return {
      label: "Carbon emissions",
      value: "–",
      unit: "",
      level: "unknown",
      headline: "Unavailable",
      explainer,
      mix: [],
      cleanest: null,
      observedAt: null,
      note: city.postcode
        ? "Carbon intensity data unavailable right now."
        : "Add a postcode to data/city.json to show this panel.",
    };
  }

  const level = CARBON_LEVEL[reading.regionIndex] ?? "unknown";
  const headline = `${capitalize(reading.regionIndex)} carbon`;
  const mix = reading.mix.slice(0, 4).map((m) => ({
    fuel: FUEL_LABELS[m.fuel] ?? capitalize(m.fuel),
    percent: m.percent,
  }));

  return {
    label: "Carbon emissions",
    value: formatNum(reading.regionIntensity),
    unit: "gCO2/kWh",
    level,
    headline,
    explainer,
    mix,
    cleanest: forecast ? cleanestWindow(forecast, city.timezone) : null,
    observedAt: reading.time,
  };
}

/**
 * The lowest-carbon window in the next 24 hours, in the city's own local
 * time. Omitted when the whole day is already "very low" — the headline
 * already says that, so a window here would just repeat it.
 */
function cleanestWindow(periods: CarbonForecastPeriod[], timeZone: string): string | null {
  if (periods.length === 0) return null;
  if (periods.every((p) => p.index === "very low")) return null;
  const minForecast = Math.min(...periods.map((p) => p.forecast));
  const start = periods.findIndex((p) => p.forecast === minForecast);
  let end = start;
  while (end + 1 < periods.length && periods[end + 1].forecast === minForecast) end++;
  return `Cleanest time today: ${formatClock(periods[start].from, timeZone)} to ${formatClock(periods[end].to, timeZone)}`;
}

function formatClock(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const period = parts.find((p) => p.type === "dayPeriod")?.value.toLowerCase() ?? "";
  return minute === "00" ? `${hour}${period}` : `${hour}:${minute}${period}`;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

export const CONDITION_LABELS: Record<Condition, string> = {
  any: "Anytime",
  "heat-high": "When it's hot",
  "heat-extreme": "Extreme heat",
  "cold-extreme": "Extreme cold",
  "air-moderate": "When air is moderate",
  "air-high": "When air is poor",
  "rain-heavy": "Heavy rain",
  "flood-risk": "Flood risk",
};

/** The most specific "when" for an action: the first non-"any" condition, else "any". */
export function primaryCondition(when: Condition[]): Condition {
  return when.find((w) => w !== "any") ?? "any";
}

export function activeConditions(panels: Panel[]): Condition[] {
  const set = new Set<Condition>(["any"]);
  panels.forEach((p) => p.conditions.forEach((c) => set.add(c)));
  return [...set];
}

function unavailable(key: Panel["key"], label: string, detail: string): Panel {
  return {
    key,
    label,
    value: "–",
    unit: "",
    level: "unknown",
    headline: "Unavailable",
    detail,
    conditions: [],
    observedAt: null,
  };
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
