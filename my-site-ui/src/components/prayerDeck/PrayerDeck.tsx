import { useState } from "react";
import { type DeckCard } from "./types";
import { PrayerDeckSetup } from "./PrayerDeckSetup";
import { PrayerDeckPlay } from "./PrayerDeckPlay";

interface PrayerDeckProps {
  openSide: boolean;
  openConnr: boolean;
}

export default function PrayerDeck({ openSide, openConnr }: PrayerDeckProps) {
  const [session, setSession] = useState<{ deck: DeckCard[]; timerSeconds: number | null } | null>(null);

  const layoutClass = [
    "flex",
    openSide  ? "ml-64" : "",
    openConnr ? "mr-90" : "",
    openConnr && !openSide ? "ml-10" : "",
    "min-h-screen w-screen flex-col items-center overflow-auto mx-auto px-4",
  ].filter(Boolean).join(" ");

  if (session) {
    return <PrayerDeckPlay deck={session.deck} timerSeconds={session.timerSeconds} onEnd={() => setSession(null)} />;
  }

  return (
    <PrayerDeckSetup
      layoutClass={layoutClass}
      onStart={(deck, timerSeconds) => setSession({ deck, timerSeconds })}
    />
  );
}
