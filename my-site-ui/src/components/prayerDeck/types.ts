export type DeckMode = "random" | "queue";

export interface PrayerName {
  id: string;
  name: string;
  description: string;
}

export interface PrayerGroup {
  id: string;
  title: string;
  mode: DeckMode;
  queueIndex: number;
  names: PrayerName[];
}

export interface PrayerDeckState {
  groups: PrayerGroup[];
}

export interface DeckCard {
  groupId: string;
  groupTitle: string;
  nameId: string;
  name: string;
  description: string;
}
