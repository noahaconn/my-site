import { useEffect, useRef, useState } from "react";
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { type PrayerGroup, type DeckCard } from "./types";
import {
  loadPrayerDeck,
  savePrayerDeck,
  exportPrayerDeck,
  importPrayerDeckFile,
  mergePrayerDeck,
  newId,
} from "./storage";
import { GroupCard } from "./GroupCard";
import { ReorderableList } from "./ReorderableList";

interface PrayerDeckSetupProps {
  layoutClass: string;
  onStart: (deck: DeckCard[], timerSeconds: number | null) => void;
}

export function PrayerDeckSetup({ layoutClass, onStart }: PrayerDeckSetupProps) {
  const [groups, setGroups] = useState<PrayerGroup[]>(() => loadPrayerDeck().groups);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [timerMinutes, setTimerMinutes] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    savePrayerDeck({ groups });
  }, [groups]);

  function addGroup() {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    setGroups((gs) => [...gs, { id: newId(), title: trimmed, mode: "random", queueIndex: 0, names: [] }]);
    setNewGroupName("");
  }

  function updateGroup(updated: PrayerGroup) {
    setGroups((gs) => gs.map((g) => (g.id === updated.id ? updated : g)));
  }

  function deleteGroup(id: string) {
    setGroups((gs) => gs.filter((g) => g.id !== id));
    setSelections((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }

  async function handleImportFile(file: File) {
    try {
      const incoming = await importPrayerDeckFile(file);
      setGroups((current) => mergePrayerDeck({ groups: current }, incoming).groups);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  function buildDeck(): DeckCard[] {
    const cards: DeckCard[] = [];
    const updatedGroups: PrayerGroup[] = [];

    groups.forEach((group) => {
      const count = Math.min(selections[group.id] ?? 0, group.names.length);
      if (count <= 0 || group.names.length === 0) {
        updatedGroups.push(group);
        return;
      }

      let picked: PrayerGroup["names"];
      let nextQueueIndex = group.queueIndex;

      if (group.mode === "queue") {
        const start = group.queueIndex % group.names.length;
        picked = [];
        for (let i = 0; i < count; i++) {
          picked.push(group.names[(start + i) % group.names.length]);
        }
        nextQueueIndex = (start + count) % group.names.length;
      } else {
        picked = [...group.names].sort(() => Math.random() - 0.5).slice(0, count);
      }

      picked.forEach((n) =>
        cards.push({
          groupId: group.id,
          groupTitle: group.title,
          nameId: n.id,
          name: n.name,
          description: n.description,
        })
      );

      updatedGroups.push({ ...group, queueIndex: nextQueueIndex });
    });

    setGroups(updatedGroups);
    return cards;
  }

  function handleStart() {
    const deck = buildDeck();
    if (deck.length === 0) return;
    const timerSeconds = timerMinutes.trim() ? Math.max(0, Number(timerMinutes) * 60) : null;
    onStart(deck, timerSeconds);
  }

  const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0);

  return (
    <main className={layoutClass}>
      <div className="max-w-4xl w-full mt-20 text-left">
        <h1 className="text-4xl font-bold dark:text-white mb-1">Prayer Deck</h1>
        <p className="text-sm dark:text-gray-500 mb-8 font-sans">
          Build groups of names, choose how many to draw from each, and start a session.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => exportPrayerDeck({ groups })}
            className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-lg
                       border border-gray-200 dark:border-gray-700
                       text-gray-500 dark:text-gray-400
                       hover:border-gray-400 dark:hover:border-gray-500
                       hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-lg
                       border border-gray-200 dark:border-gray-700
                       text-gray-500 dark:text-gray-400
                       hover:border-gray-400 dark:hover:border-gray-500
                       hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          {importError && <span className="text-xs text-red-500 font-sans">{importError}</span>}
          <span className="text-xs text-gray-300 dark:text-gray-700 font-sans ml-1">
            Accounts &amp; cross-device sync are planned for later — for now, export/import moves data between devices.
          </span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGroup()}
            placeholder="New group name…"
            className="flex-1 px-3 py-1.5 rounded-lg text-sm font-sans
                       bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={addGroup}
            aria-label="Add group"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                       text-gray-500 dark:text-gray-400 hover:border-orange-400
                       hover:text-orange-500 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {groups.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 font-sans py-8">
            No groups yet — add one above to get started.
          </p>
        )}

        <ReorderableList
          items={groups}
          getId={(g) => g.id}
          onReorder={setGroups}
          renderItem={(group, handle) => (
            <GroupCard
              group={group}
              selectedCount={selections[group.id] ?? 0}
              onChange={updateGroup}
              onDelete={() => deleteGroup(group.id)}
              onSelectedCountChange={(count) => setSelections((s) => ({ ...s, [group.id]: count }))}
              dragHandleProps={handle}
            />
          )}
        />

        <div className="flex flex-wrap items-center gap-4 mt-8 pb-24">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans">
              Session timer (minutes, optional)
            </label>
            <input
              type="number"
              min={0}
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
              placeholder="No timer"
              className="w-40 px-3 py-1.5 rounded-lg text-sm font-sans
                         bg-white dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         text-gray-800 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={totalSelected === 0}
            className="px-5 py-2 rounded-lg text-sm font-sans font-semibold
                       bg-orange-500 text-white hover:bg-orange-600
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start ({totalSelected} name{totalSelected === 1 ? "" : "s"})
          </button>
        </div>
      </div>
    </main>
  );
}
