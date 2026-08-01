import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — set these to wherever you host the files in your public folder
// ─────────────────────────────────────────────────────────────────────────────
const BOOKS_BASE_URL = "/greek-reader/json";
const STRONGS_URL    = "/greek-reader/strongs-greek.json";
const LS_KEY         = "nt-greek-set";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Token = {
  id: string;
  english: string;
  surface: string;
  strong: string;
  lemma?: string;
  morph?: string;
};

type Verse = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  tokens: Token[];
};

type StrongsEntry = {
  lemma?: string;
  translit?: string;
  strongs_def?: string;
  derivation?: string;
  kjv_def?: string;
};

type StrongsDict = Record<string, StrongsEntry>;

type LoadedBook = {
  code: string;
  verses: Verse[];
};

type GreekReaderProps = {
  openSide: boolean;
  openConnr: boolean;
};

type GlossPopoverProps = {
  token: Token;
  entry: StrongsEntry | null;
  inGreek: boolean;
  onToggle: () => void;
  onClose: () => void;
};

type VerseRowProps = {
  verse: Verse;
  greekSet: Set<string>;
  activeToken: Token | null;
  onTokenClick: (tok: Token) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BOOK_LIST: [string, string][] = [
  ["MAT","Matthew"],["MRK","Mark"],["LUK","Luke"],["JHN","John"],
  ["ACT","Acts"],["ROM","Romans"],["1CO","1 Corinthians"],["2CO","2 Corinthians"],
  ["GAL","Galatians"],["EPH","Ephesians"],["PHP","Philippians"],["COL","Colossians"],
  ["1TH","1 Thessalonians"],["2TH","2 Thessalonians"],["1TI","1 Timothy"],
  ["2TI","2 Timothy"],["TIT","Titus"],["PHM","Philemon"],["HEB","Hebrews"],
  ["JAS","James"],["1PE","1 Peter"],["2PE","2 Peter"],["1JN","1 John"],
  ["2JN","2 John"],["3JN","3 John"],["JUD","Jude"],["REV","Revelation"],
];

const BOOK_NAMES: Record<string, string> = Object.fromEntries(BOOK_LIST);

function toStrongsKey(padded: string): string {
  return padded.replace(/^([GH])0+/, "$1");
}

// ─────────────────────────────────────────────────────────────────────────────
// GlossPopover
// ─────────────────────────────────────────────────────────────────────────────
function GlossPopover({ token, entry, inGreek, onToggle, onClose }: GlossPopoverProps) {
  const def = entry
    ? (entry.strongs_def || entry.derivation || "").trim()
    : "No definition found.";

  return (
    <>
      {/* Scrim */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                      w-[min(460px,calc(100vw-32px))]
                      bg-white dark:bg-gray-900
                      border border-gray-200 dark:border-gray-700
                      rounded-2xl shadow-2xl p-5">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-300 dark:text-gray-600
                     hover:text-gray-500 dark:hover:text-gray-400
                     text-xl leading-none"
        >
          ×
        </button>

        {/* English source word */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-sans">
          &ldquo;{token.english}&rdquo;
        </p>

        {/* Greek surface form */}
        <p
          className="text-3xl text-gray-900 dark:text-white mb-0.5"
          style={{ fontFamily: "'GFS Didot', 'Gentium Plus', 'Cardo', Georgia, serif" }}
        >
          {token.surface}
        </p>

        {/* Lemma · translit · strongs */}
        <p className="text-xs text-gray-400 dark:text-gray-500 italic font-sans mb-3">
          {entry?.lemma ?? token.surface}
          {entry?.translit ? <> &nbsp;·&nbsp; {entry.translit}</> : null}
          &nbsp;·&nbsp;
          <span className="not-italic font-mono">{token.strong}</span>
        </p>

        <hr className="border-gray-100 dark:border-gray-800 mb-3" />

        {/* Definition */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-1">
          {def}
        </p>
        {entry?.kjv_def && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-sans mb-4">
            KJV: &ldquo;{entry.kjv_def}&rdquo;
          </p>
        )}

        {/* Toggle — matches site orange gradient for primary action */}
        {inGreek ? (
          <button
            onClick={onToggle}
            className="w-full py-2.5 rounded-xl text-sm font-medium font-sans
                       bg-gray-100 dark:bg-gray-800
                       text-gray-700 dark:text-gray-300
                       border border-gray-200 dark:border-gray-700
                       hover:bg-gray-200 dark:hover:bg-gray-700
                       transition-colors"
          >
            Restore English
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="w-full py-2.5 rounded-xl text-sm font-medium font-sans text-white
                       bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500
                       hover:from-orange-400 hover:via-orange-500 hover:to-orange-600
                       shadow-sm transition-colors"
          >
            Show Greek
          </button>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VerseRow
// ─────────────────────────────────────────────────────────────────────────────
function VerseRow({ verse, greekSet, activeToken, onTokenClick }: VerseRowProps) {
  return (
    <p
      className="mb-3 leading-loose dark:text-gray-300"
      style={{
        fontSize: "1.0625rem",
        fontFamily: "'GFS Didot', 'Gentium Plus', 'Cardo', Georgia, serif",
      }}
    >
      <sup className="text-[10px] text-gray-300 dark:text-gray-600 mr-1 font-sans select-none">
        {verse.verse}
      </sup>

      {verse.tokens.map((tok, i) => {
        const inGreek  = greekSet.has(tok.strong);
        const isActive =
          activeToken?.strong  === tok.strong &&
          activeToken?.surface === tok.surface &&
          activeToken?.english === tok.english;

        return (
          <span key={i}>
            <span
              onClick={() => onTokenClick(tok)}
              className={[
                "cursor-pointer rounded px-px transition-colors duration-100",
                inGreek
                  ? "text-emerald-700 dark:text-emerald-400 italic"
                  : "hover:bg-orange-50 dark:hover:bg-gray-800",
                isActive ? "bg-emerald-50 dark:bg-emerald-950" : "",
              ].filter(Boolean).join(" ")}
            >
              {inGreek ? tok.surface : tok.english}
            </span>
            {i < verse.tokens.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function GreekReader({ openSide, openConnr }: GreekReaderProps) {
  const [strongsDict, setStrongsDict] = useState<StrongsDict>({});
  const [loadedBook, setLoadedBook]   = useState<LoadedBook | null>(null);
  const [selectedBook, setSelectedBook]       = useState<string>("JHN");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapters, setChapters]   = useState<number[]>([]);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string | null>(null);

  const [greekSet, setGreekSet] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Load Strong's once
  useEffect(() => {
    fetch(STRONGS_URL)
      .then((r) => r.json())
      .then((data: StrongsDict) => setStrongsDict(data))
      .catch(() => console.warn("Could not load Strong's dictionary"));
  }, []);

  // Load book when selection changes
  useEffect(() => {
    if (!selectedBook) return;
    setLoading(true);
    setError(null);
    setActiveToken(null);

    fetch(`${BOOKS_BASE_URL}/${selectedBook}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Verse[]>;
      })
      .then((verses) => {
        const chs = [...new Set(verses.map((v) => v.chapter))].sort((a, b) => a - b);
        setLoadedBook({ code: selectedBook, verses });
        setChapters(chs);
        setSelectedChapter(chs[0]);
        setLoading(false);
      })
      .catch(() => {
        setError(`Could not load ${selectedBook}.json`);
        setLoading(false);
      });
  }, [selectedBook]);

  // Persist greekSet
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...greekSet]));
    } catch (e) {
      console.warn("Failed to persist Greek selections:", e);
    }
  }, [greekSet]);

  const lookupStrongs = useCallback(
    (padded: string): StrongsEntry | null =>
      strongsDict[toStrongsKey(padded)] ?? null,
    [strongsDict]
  );

  const toggleStrong = useCallback((strong: string) => {
    setGreekSet((prev) => {
      const next = new Set(prev);
      if (next.has(strong)) {
        next.delete(strong)
      } else {
        next.add(strong);
      } 
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setGreekSet(new Set<string>());
    setActiveToken(null);
  }, []);

  const verses = loadedBook
    ? loadedBook.verses.filter((v) => v.chapter === selectedChapter)
    : [];

  const greekCount = greekSet.size;

  // Match Bio layout logic exactly
  const layoutClass = [
    "flex",
    openSide  ? "ml-64" : "",
    openConnr ? "mr-90" : "",
    openConnr && !openSide ? "ml-10" : "",
    "min-h-screen w-screen flex-col items-center overflow-auto mx-auto px-4",
  ].filter(Boolean).join(" ");

  return (
    <main className={layoutClass}>
      <div className="max-w-4xl w-full mt-20 text-left">

        {/* Header */}
        <h1 className="text-4xl font-bold dark:text-white mb-1">
          Greek NT Reader
        </h1>
        <p className="text-sm dark:text-gray-500 mb-8 font-sans">
          Click any word to see its Greek root · toggle between English and Greek
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans">
              Book
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-sans
                         bg-white dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         text-gray-800 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {BOOK_LIST.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
              disabled={chapters.length === 0}
              className="px-3 py-1.5 rounded-lg text-sm font-sans
                         bg-white dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         text-gray-800 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         disabled:opacity-40"
            >
              {chapters.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {greekCount > 0 && (
            <div className="flex items-center gap-2 ml-auto mt-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-sans">
                {greekCount} word{greekCount > 1 ? "s" : ""} in Greek
              </span>
              <button
                onClick={clearAll}
                className="text-xs font-sans px-2.5 py-1 rounded-lg
                           border border-gray-200 dark:border-gray-700
                           text-gray-500 dark:text-gray-400
                           hover:border-gray-400 dark:hover:border-gray-500
                           hover:text-gray-700 dark:hover:text-gray-200
                           transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Chapter heading */}
        {!loading && !error && loadedBook && (
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-sans mb-5">
            {BOOK_NAMES[loadedBook.code]} · Chapter {selectedChapter}
          </p>
        )}

        {loading && (
          <p className="text-sm text-gray-400 dark:text-gray-500 font-sans py-12 text-center">
            Loading…
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 font-sans py-8">{error}</p>
        )}

        {/* Verses */}
        {!loading && !error && (
          <div className="pb-32">
            {verses.map((verse) => (
              <VerseRow
                key={verse.id}
                verse={verse}
                greekSet={greekSet}
                activeToken={activeToken}
                onTokenClick={setActiveToken}
              />
            ))}
            {verses.length > 0 && (
              <p className="text-center text-xs text-gray-300 dark:text-gray-700 font-sans italic mt-8">
                — end of {BOOK_NAMES[loadedBook?.code ?? ""]} {selectedChapter} —
              </p>
            )}
            {verses.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-sans px-4 py-2 rounded-lg
                            border border-gray-200 dark:border-gray-700
                            text-gray-400 dark:text-gray-500
                            hover:border-gray-400 dark:hover:border-gray-500
                            hover:text-gray-700 dark:hover:text-gray-200
                            transition-colors"
                >
                  ↑ Back to top
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gloss popover */}
      {activeToken && (
        <GlossPopover
          token={activeToken}
          entry={lookupStrongs(activeToken.strong)}
          inGreek={greekSet.has(activeToken.strong)}
          onToggle={() => toggleStrong(activeToken.strong)}
          onClose={() => setActiveToken(null)}
        />
      )}
    </main>
  );
}
