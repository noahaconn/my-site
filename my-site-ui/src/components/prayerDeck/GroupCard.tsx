import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { type PrayerGroup, type PrayerName } from "./types";
import { ReorderableList, type DragHandleProps } from "./ReorderableList";
import { newId } from "./storage";

interface GroupCardProps {
  group: PrayerGroup;
  selectedCount: number;
  onChange: (group: PrayerGroup) => void;
  onDelete: () => void;
  onSelectedCountChange: (count: number) => void;
  dragHandleProps: DragHandleProps;
}

export function GroupCard({
  group,
  selectedCount,
  onChange,
  onDelete,
  onSelectedCountChange,
  dragHandleProps,
}: GroupCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [titleDraft, setTitleDraft] = useState(group.title);
  const [newName, setNewName] = useState("");

  function updateNames(names: PrayerName[]) {
    onChange({ ...group, names });
  }

  function addName() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    updateNames([...group.names, { id: newId(), name: trimmed, description: "" }]);
    setNewName("");
  }

  function updateName(id: string, patch: Partial<PrayerName>) {
    updateNames(group.names.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  function deleteName(id: string) {
    updateNames(group.names.filter((n) => n.id !== id));
  }

  const maxCount = group.names.length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mb-3">
      <div className="flex items-center gap-2 px-4 py-3">
        <span {...dragHandleProps}>
          <Bars3Icon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        </span>
        <button onClick={() => setCollapsed((c) => !c)} className="text-gray-400 dark:text-gray-500">
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>

        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => onChange({ ...group, title: titleDraft.trim() || group.title })}
          className="flex-1 bg-transparent font-sans text-sm font-semibold
                     text-gray-800 dark:text-gray-100 focus:outline-none
                     border-b border-transparent focus:border-orange-400"
        />

        <span className="text-xs text-gray-400 dark:text-gray-500 font-sans">
          {group.names.length} name{group.names.length === 1 ? "" : "s"}
        </span>

        <button
          onClick={onDelete}
          aria-label="Delete group"
          className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans">
                Draw mode
              </label>
              <select
                value={group.mode}
                onChange={(e) => onChange({ ...group, mode: e.target.value as PrayerGroup["mode"] })}
                className="px-3 py-1.5 rounded-lg text-sm font-sans
                           bg-white dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700
                           text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="random">Random</option>
                <option value="queue">Queue</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans">
                Pray for
              </label>
              <input
                type="number"
                min={0}
                max={maxCount}
                value={selectedCount}
                onChange={(e) =>
                  onSelectedCountChange(Math.max(0, Math.min(maxCount, Number(e.target.value) || 0)))
                }
                className="w-20 px-3 py-1.5 rounded-lg text-sm font-sans
                           bg-white dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700
                           text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <ReorderableList
            items={group.names}
            getId={(n) => n.id}
            onReorder={updateNames}
            renderItem={(n, handle) => (
              <div className="flex items-start gap-2 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <span {...handle}>
                  <Bars3Icon className="w-4 h-4 mt-1.5 text-gray-200 dark:text-gray-700" />
                </span>
                <div className="flex-1">
                  <input
                    value={n.name}
                    onChange={(e) => updateName(n.id, { name: e.target.value })}
                    className="w-full bg-transparent font-sans text-sm text-gray-800
                               dark:text-gray-100 focus:outline-none border-b
                               border-transparent focus:border-orange-400"
                  />
                  <input
                    value={n.description}
                    placeholder="What to pray for (optional)"
                    onChange={(e) => updateName(n.id, { description: e.target.value })}
                    className="w-full bg-transparent font-sans text-xs text-gray-400
                               dark:text-gray-500 focus:outline-none mt-0.5
                               border-b border-transparent focus:border-orange-400"
                  />
                </div>
                <button
                  onClick={() => deleteName(n.id)}
                  aria-label="Delete name"
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors mt-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          />

          <div className="flex items-center gap-2 mt-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addName()}
              placeholder="Add a name…"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm font-sans
                         bg-white dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         text-gray-800 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={addName}
              aria-label="Add name"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                         text-gray-500 dark:text-gray-400 hover:border-orange-400
                         hover:text-orange-500 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
