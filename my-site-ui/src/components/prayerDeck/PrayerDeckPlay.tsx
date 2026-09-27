import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { type DeckCard } from "./types";

interface PrayerDeckPlayProps {
  deck: DeckCard[];
  timerSeconds: number | null;
  onEnd: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PrayerDeckPlay({ deck, timerSeconds, onEnd }: PrayerDeckPlayProps) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(timerSeconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerSeconds === null) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => (r === null ? null : Math.max(0, r - 1)));
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [timerSeconds]);

  function goNext() {
    setIndex((i) => Math.min(deck.length - 1, i + 1));
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  const card = deck[index];
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-81 bg-white dark:bg-black flex flex-col select-none">
      <div className="flex items-center justify-between px-6 pt-6 font-sans">
        <span className="text-sm text-gray-400 dark:text-gray-600 tabular-nums">
          {remaining !== null ? formatTime(remaining) : ""}
        </span>
        <button
          onClick={onEnd}
          aria-label="End session"
          className="text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-10">
        <button onClick={goPrev} aria-label="Previous" className="absolute inset-y-0 left-0 w-1/2 cursor-pointer" />
        <button onClick={goNext} aria-label="Next" className="absolute inset-y-0 right-0 w-1/2 cursor-pointer" />

        <div className="relative text-center max-w-md pointer-events-none">
          <p className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">{card.name}</p>
          {card.description && (
            <p className="text-base text-gray-400 dark:text-gray-500 font-sans">{card.description}</p>
          )}
        </div>
      </div>

      <div className="pb-6 text-center font-sans">
        <span className="text-xs uppercase tracking-widest text-gray-300 dark:text-gray-700">
          {index + 1} of {deck.length}
        </span>
      </div>
    </div>
  );
}
