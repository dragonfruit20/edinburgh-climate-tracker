// Live feeds. Each function fetches on the server and Next.js caches the
// result for `revalidate` seconds. The first visitor after the window
// triggers a fresh pull; everyone else gets the cached copy.
//
// Every function returns null on failure so one dead feed never breaks
// the page. The UI shows "unavailable" instead. None of these need an
// API key — Open-Meteo's free endpoints are open to anyone.

import type { City } from "./types";

const HOUR = 3600;
const HALF_HOUR = 1800;

export interface AirReading {
  usAqi: number;
  pm25: number;
  time: string; // ISO, local to the city
}

export interface WeatherReading {
  temperature: number;
  feelsLike: number;
  feelsLikeMaxToday: number;
  rainTodayMm: number; // forecast total for today
  rainChanceMax: number | null; // % chance, max over today
  time: string;
}

export interface FloodReading {
  discharge: number; // m³/s, today
  dischargeMean: number; // long-term mean for this day of year
  date: string; // YYYY-MM-DD
}

export async function fetchAir(city: City): Promise<AirReading | null> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=us_aqi,pm2_5&timezone=${encodeURIComponent(city.timezone)}`;
  try {
    const res = await fetch(url, { next: { revalidate: HOUR } });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      usAqi: Math.round(json.current.us_aqi),
      pm25: json.current.pm2_5,
      time: json.current.time,
    };
  } catch {
    return null;
  }
}

export async function fetchWeather(city: City): Promise<WeatherReading | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=temperature_2m,apparent_temperature` +
    `&daily=apparent_temperature_max,precipitation_sum,precipitation_probability_max&forecast_days=1` +
    `&timezone=${encodeURIComponent(city.timezone)}`;
  try {
    const res = await fetch(url, { next: { revalidate: HOUR } });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      temperature: json.current.temperature_2m,
      feelsLike: json.current.apparent_temperature,
      feelsLikeMaxToday: json.daily.apparent_temperature_max[0],
      rainTodayMm: json.daily.precipitation_sum?.[0] ?? 0,
      rainChanceMax: json.daily.precipitation_probability_max?.[0] ?? null,
      time: json.current.time,
    };
  } catch {
    return null;
  }
}

/**
 * River flood signal from Open-Meteo's flood API (GloFAS model, global).
 * Compares today's modelled river discharge near the city with the
 * long-term mean for this day of year. No key needed.
 */
export async function fetchFlood(city: City): Promise<FloodReading | null> {
  const url =
    `https://flood-api.open-meteo.com/v1/flood` +
    `?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&daily=river_discharge,river_discharge_mean&forecast_days=1`;
  try {
    const res = await fetch(url, { next: { revalidate: 6 * HOUR } });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.daily?.river_discharge?.[0];
    const m = json.daily?.river_discharge_mean?.[0];
    if (typeof d !== "number" || typeof m !== "number") return null;
    return { discharge: d, dischargeMean: m, date: json.daily.time[0] };
  } catch {
    return null;
  }
}

export interface CarbonMixEntry {
  fuel: string;
  percent: number;
}

export interface CarbonReading {
  regionIntensity: number; // gCO2/kWh, forecast for the city's region right now
  regionIndex: string; // "very low" .. "very high"
  gbIntensity: number; // gCO2/kWh, Great Britain average right now
  gbIndex: string;
  mix: CarbonMixEntry[]; // non-zero sources, highest share first
  time: string; // ISO, start of the current half-hour reading
}

export interface CarbonForecastPeriod {
  from: string; // ISO
  to: string; // ISO
  forecast: number; // gCO2/kWh
  index: string;
}

/**
 * UK Carbon Intensity API (National Energy System Operator). Free, no key.
 * UK-only: needs city.postcode, so this returns null for any other city.
 * The regional endpoint nests the reading one level deeper than the GB
 * one — data[0].data[0] vs data[0] — because a postcode can only ever
 * match one region, so the outer array always has exactly one entry.
 */
export async function fetchCarbon(city: City): Promise<CarbonReading | null> {
  if (!city.postcode) return null;
  try {
    const [regionalRes, gbRes] = await Promise.all([
      fetch(`https://api.carbonintensity.org.uk/regional/postcode/${city.postcode}`, {
        next: { revalidate: HALF_HOUR },
      }),
      fetch(`https://api.carbonintensity.org.uk/intensity`, { next: { revalidate: HALF_HOUR } }),
    ]);
    if (!regionalRes.ok || !gbRes.ok) return null;
    const regionalJson = await regionalRes.json();
    const gbJson = await gbRes.json();

    const period = regionalJson.data?.[0]?.data?.[0];
    const gbPeriod = gbJson.data?.[0];
    if (!period || !gbPeriod) return null;

    const mix: CarbonMixEntry[] = (period.generationmix ?? [])
      .map((m: { fuel: string; perc: number }) => ({ fuel: m.fuel, percent: m.perc }))
      .filter((m: CarbonMixEntry) => m.percent > 0)
      .sort((a: CarbonMixEntry, b: CarbonMixEntry) => b.percent - a.percent);

    return {
      regionIntensity: period.intensity.forecast,
      regionIndex: period.intensity.index,
      gbIntensity: gbPeriod.intensity.actual ?? gbPeriod.intensity.forecast,
      gbIndex: gbPeriod.intensity.index,
      mix,
      time: period.from,
    };
  } catch {
    return null;
  }
}

/** Same 30-minute UK feed's 24-hour-ahead forecast for the city's region. */
export async function fetchCarbonForecast(city: City): Promise<CarbonForecastPeriod[] | null> {
  if (!city.postcode) return null;
  try {
    const from = new Date().toISOString().slice(0, 16) + "Z";
    const url = `https://api.carbonintensity.org.uk/regional/intensity/${from}/fw24h/postcode/${city.postcode}`;
    const res = await fetch(url, { next: { revalidate: HALF_HOUR } });
    if (!res.ok) return null;
    const json = await res.json();
    const periods = json.data?.data;
    if (!Array.isArray(periods)) return null;
    return periods.map((p: { from: string; to: string; intensity: { forecast: number; index: string } }) => ({
      from: p.from,
      to: p.to,
      forecast: p.intensity.forecast,
      index: p.intensity.index,
    }));
  } catch {
    return null;
  }
}
