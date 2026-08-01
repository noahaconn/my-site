"use client";

import { useEffect, useState } from "react";
import bomData from "../../scriptures/bom.json";

type BioProps = {
  openSide: boolean;
  openConnr: boolean;
};

type QuizItem = {
  type: "verse" | "heading";
  reference: string;
  text: string;
};

type ParsedReference = {
  book: string;
  chapter: string | null;
  verse: string | null;
};

type PartScore = {
  correct: number;
  total: number;
};

type ScoreState = {
  book: PartScore;
  chapter: PartScore;
  verse: PartScore;
};

const EMPTY_SCORE: ScoreState = {
  book: { correct: 0, total: 0 },
  chapter: { correct: 0, total: 0 },
  verse: { correct: 0, total: 0 },
};

export default function BoMQuiz({
  openSide,
  openConnr,
}: BioProps) {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState<QuizItem | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState<ScoreState>(EMPTY_SCORE);

  useEffect(() => {
    const combined: QuizItem[] = [
      ...(bomData.verses ?? []).map((v) => ({
        type: "verse" as const,
        reference: v.reference,
        text: v.text,
      })),
      ...(bomData.headings ?? []).map((h) => ({
        type: "heading" as const,
        reference: h.reference,
        text: h.text,
      })),
    ];

    setItems(combined);

    if (combined.length > 0) {
      setCurrent(
        combined[Math.floor(Math.random() * combined.length)]
      );
    }
  }, []);

  function normalize(text: string) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }

  // Splits a reference like "1 Nephi 3:7" into book/chapter/verse.
  // References that are only book headings ("Alma") or chapter
  // headings ("Alma 32") will simply have null chapter and/or verse.
  function parseReference(ref: string): ParsedReference {
    const match = ref
      .trim()
      .match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+(?:[-–]\d+)?))?$/);

    if (match) {
      return {
        book: match[1],
        chapter: match[2],
        verse: match[3] ?? null,
      };
    }

    return { book: ref.trim(), chapter: null, verse: null };
  }

  function nextQuestion() {
    if (items.length === 0) return;

    setCurrent(
      items[Math.floor(Math.random() * items.length)]
    );

    setGuess("");
    setResult("");
  }

  function submitGuess() {
    if (!current) return;

    const answer = parseReference(current.reference);
    const attempt = parseReference(guess);

    const bookCorrect =
      normalize(attempt.book) === normalize(answer.book);

    const chapterCorrect =
      answer.chapter !== null &&
      attempt.chapter !== null &&
      normalize(attempt.chapter) === normalize(answer.chapter);

    const verseCorrect =
      answer.verse !== null &&
      attempt.verse !== null &&
      normalize(attempt.verse) === normalize(answer.verse);

    setScore((prev) => ({
      book: {
        correct: prev.book.correct + (bookCorrect ? 1 : 0),
        total: prev.book.total + 1,
      },
      chapter:
        answer.chapter !== null
          ? {
              correct:
                prev.chapter.correct + (chapterCorrect ? 1 : 0),
              total: prev.chapter.total + 1,
            }
          : prev.chapter,
      verse:
        answer.verse !== null
          ? {
              correct: prev.verse.correct + (verseCorrect ? 1 : 0),
              total: prev.verse.total + 1,
            }
          : prev.verse,
    }));

    const lines = [
      `Book: ${bookCorrect ? "✓" : "✗"}`,
      answer.chapter !== null
        ? `Chapter: ${chapterCorrect ? "✓" : "✗"}`
        : null,
      answer.verse !== null
        ? `Verse: ${verseCorrect ? "✓" : "✗"}`
        : null,
      "",
      `Answer: ${current.reference}`,
      "",
      current.text,
    ].filter((line) => line !== null);

    setResult(lines.join("\n"));
  }

  const displayText =
    current?.type === "verse" && current.text.length > 300
      ? current.text.slice(0, 300) + "..."
      : current?.text ?? "Loading...";

  return (
    <main
      className={`flex ${
        openSide ? "ml-64" : ""
      } ${
        openConnr ? "mr-90" : ""
      } ${
        openConnr && !openSide ? "ml-10" : ""
      } min-h-screen w-screen flex-col items-center overflow-auto mx-auto px-4`}
    >
      <div className="max-w-3xl w-full mt-20">

        <h1 className="text-4xl font-bold dark:text-white mb-2">
          Book of Mormon Quiz
        </h1>

        <p className="dark:text-gray-500 mb-8">
          Guess the reference from the verse or heading.
        </p>

        <div className="dark:text-gray-300 mb-6 flex gap-6 flex-wrap">
          <div>
            <span className="font-bold">Book:</span>{" "}
            {score.book.correct} / {score.book.total}
          </div>
          <div>
            <span className="font-bold">Chapter:</span>{" "}
            {score.chapter.correct} / {score.chapter.total}
          </div>
          <div>
            <span className="font-bold">Verse:</span>{" "}
            {score.verse.correct} / {score.verse.total}
          </div>
        </div>

        <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <p className="dark:text-gray-300 whitespace-pre-wrap">
            {displayText}
          </p>
        </div>

        <input
          type="text"
          placeholder="Example: Alma 32 or 1 Nephi 3:7"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitGuess();
            }
          }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 dark:text-white mb-4"
        />

        <div className="flex gap-3 mb-6">
          <button
            onClick={submitGuess}
            className="rounded-lg text-white bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 shadow-sm px-4 py-2"
          >
            Submit
          </button>

          <button
            onClick={nextQuestion}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 dark:text-white"
          >
            Next
          </button>
        </div>

        {result && (
          <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-6">
            <pre className="whitespace-pre-wrap font-sans dark:text-gray-300">
              {result}
            </pre>
          </div>
        )}

      </div>
    </main>
  );
}
