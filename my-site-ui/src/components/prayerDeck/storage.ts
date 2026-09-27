import { type PrayerDeckState, type PrayerGroup } from "./types";

const STORAGE_KEY = "prayerDeck:v1";
const EMPTY_STATE: PrayerDeckState = { groups: [] };

export function loadPrayerDeck(): PrayerDeckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.groups)) return EMPTY_STATE;
    return parsed as PrayerDeckState;
  } catch {
    return EMPTY_STATE;
  }
}

export function savePrayerDeck(state: PrayerDeckState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save prayer deck data", err);
  }
}

export function exportPrayerDeck(state: PrayerDeckState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `prayer-deck-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function mergePrayerDeck(
  current: PrayerDeckState,
  incoming: PrayerDeckState
): PrayerDeckState {
  const byId = new Map<string, PrayerGroup>();
  current.groups.forEach((g) => byId.set(g.id, g));
  incoming.groups.forEach((g) => byId.set(g.id, g));
  return { groups: Array.from(byId.values()) };
}

export function importPrayerDeckFile(file: File): Promise<PrayerDeckState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.groups)) {
          reject(new Error("That file doesn't look like a prayer deck export."));
          return;
        }
        resolve(parsed as PrayerDeckState);
      } catch {
        reject(new Error("Couldn't parse that file as JSON."));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
