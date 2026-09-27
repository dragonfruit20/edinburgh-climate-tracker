// Loads the two data files a human (or Cowork's research skill) writes by
// hand, and checks every entry against the schema before the site trusts
// it. A malformed entry is dropped and recorded as an issue instead of
// crashing the page — the same "degrade, don't crash" rule as the feeds.

import verifiedRaw from "@/data/verified.json";
import flaggedRaw from "@/data/flagged.json";
import type { Action, Condition } from "./types";

const VALID_CONDITIONS: Condition[] = [
  "any",
  "heat-high",
  "heat-extreme",
  "cold-extreme",
  "air-moderate",
  "air-high",
  "rain-heavy",
  "flood-risk",
];

export interface ActionIssue {
  file: string;
  index: number;
  id: string | null;
  problems: string[];
}

function checkAction(entry: unknown, file: string, index: number): { action: Action | null; issue: ActionIssue | null } {
  const problems: string[] = [];
  const e = entry as Record<string, unknown>;

  if (typeof e !== "object" || e === null) {
    return { action: null, issue: { file, index, id: null, problems: ["entry is not an object"] } };
  }

  const id = typeof e.id === "string" ? e.id : null;
  if (!id) problems.push("missing or non-string \"id\"");
  if (typeof e.city !== "string" || !e.city) problems.push("missing or non-string \"city\"");
  if (typeof e.category !== "string" || !e.category) problems.push("missing or non-string \"category\"");
  if (typeof e.title !== "string" || !e.title) problems.push("missing or non-string \"title\"");
  if (typeof e.summary !== "string" || !e.summary) problems.push("missing or non-string \"summary\"");

  if (!Array.isArray(e.details) || e.details.length === 0 || !e.details.every((d) => typeof d === "string")) {
    problems.push("\"details\" must be a non-empty array of strings");
  }

  if (!Array.isArray(e.when) || e.when.length === 0) {
    problems.push("\"when\" must be a non-empty array");
  } else {
    const bad = e.when.filter((w) => !VALID_CONDITIONS.includes(w as Condition));
    if (bad.length > 0) problems.push(`"when" has unknown condition(s): ${bad.join(", ")}`);
  }

  if (!Array.isArray(e.sources) || e.sources.length === 0) {
    problems.push("\"sources\" must be a non-empty array");
  } else {
    const badSource = e.sources.some(
      (s) => typeof s !== "object" || s === null || typeof (s as Record<string, unknown>).title !== "string" || typeof (s as Record<string, unknown>).url !== "string"
    );
    if (badSource) problems.push("every source needs a \"title\" and \"url\" string");
  }

  const v = e.verification as Record<string, unknown> | undefined;
  if (typeof v !== "object" || v === null) {
    problems.push("missing \"verification\" object");
  } else {
    if (v.status !== "verified" && v.status !== "flagged") problems.push("verification.status must be \"verified\" or \"flagged\"");
    if (typeof v.lastChecked !== "string" || !v.lastChecked) problems.push("verification.lastChecked missing");
    if (typeof v.method !== "string" || !v.method) problems.push("verification.method missing");
    if (v.status === "flagged" && (typeof v.flag_reason !== "string" || !v.flag_reason)) {
      problems.push("flagged entries need verification.flag_reason");
    }
  }

  if (problems.length > 0) {
    return { action: null, issue: { file, index, id, problems } };
  }
  return { action: e as unknown as Action, issue: null };
}

function loadFile(raw: unknown[], file: string): { actions: Action[]; issues: ActionIssue[] } {
  const actions: Action[] = [];
  const issues: ActionIssue[] = [];
  raw.forEach((entry, index) => {
    const { action, issue } = checkAction(entry, file, index);
    if (action) actions.push(action);
    if (issue) issues.push(issue);
  });
  return { actions, issues };
}

const verifiedResult = loadFile(verifiedRaw as unknown[], "verified.json");
const flaggedResult = loadFile(flaggedRaw as unknown[], "flagged.json");

export const verifiedActions: Action[] = verifiedResult.actions;
export const flaggedActions: Action[] = flaggedResult.actions;
export const actionIssues: ActionIssue[] = [...verifiedResult.issues, ...flaggedResult.issues];

export function categoriesOf(actions: Action[]): string[] {
  return [...new Set(actions.map((a) => a.category))].sort();
}

/** Conditions (excluding "any") that this action shares with today's active conditions. */
export function matchedConditions(action: Action, active: Condition[]): Condition[] {
  return action.when.filter((w) => w !== "any" && active.includes(w));
}

const SEVERITY: Partial<Record<Condition, number>> = {
  "heat-extreme": 4,
  "cold-extreme": 4,
  "flood-risk": 4,
  "air-high": 3,
  "rain-heavy": 3,
  "heat-high": 2,
  "air-moderate": 1,
};

function severityScore(conditions: Condition[]): number {
  return conditions.reduce((max, c) => Math.max(max, SEVERITY[c] ?? 0), 0);
}

/** Actions that match at least one of today's active conditions, most urgent first. */
export function todayActions(actions: Action[], active: Condition[]): Action[] {
  return actions
    .map((action) => ({ action, matches: matchedConditions(action, active) }))
    .filter((x) => x.matches.length > 0)
    .sort((a, b) => severityScore(b.matches) - severityScore(a.matches))
    .map((x) => x.action);
}
