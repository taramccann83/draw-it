"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { RulesModal } from "@/components/game/rules-modal";
import { DrawingCanvas } from "@/components/canvas/drawing-canvas";
import { levels } from "@/lib/levels";
import { useRouter } from "next/navigation";

type GamePhase = "setup" | "rules" | "playing" | "reviewing" | "results";

interface PlayerResult {
  playerName: string;
  stars: number;
  message: string;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [players, setPlayers] = useState<string[]>(["", ""]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [roundResult, setRoundResult] = useState<{
    stars: number;
    message: string;
    tip: string | null;
  } | null>(null);

  // Use easy levels for multiplayer
  const easyLevels = levels.filter((l) => l.difficulty === "easy");
  const currentLevel = easyLevels[currentRound % easyLevels.length];

  function addPlayer() {
    if (players.length < 4) setPlayers([...players, ""]);
  }

  function removePlayer(i: number) {
    if (players.length > 2) setPlayers(players.filter((_, idx) => idx !== i));
  }

  function updatePlayer(i: number, name: string) {
    const updated = [...players];
    updated[i] = name;
    setPlayers(updated);
  }

  function startGame() {
    const filled = players.filter((p) => p.trim());
    if (filled.length < 2) return;
    setPlayers(filled);
    setPhase("rules");
  }

  async function handleDrawingDone(dataUrl: string) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          levelId: currentLevel.id,
          levelTitle: currentLevel.title,
          levelDescription: currentLevel.description,
        }),
      });

      const data = await res.json();
      setRoundResult(data);

      setResults((prev) => [
        ...prev,
        {
          playerName: players[currentPlayerIndex],
          stars: data.stars,
          message: data.message,
        },
      ]);
    } catch {
      setRoundResult({
        stars: 1,
        message: "Great effort! Keep it up!",
        tip: null,
      });
      setResults((prev) => [
        ...prev,
        { playerName: players[currentPlayerIndex], stars: 1, message: "" },
      ]);
    } finally {
      setSubmitting(false);
      setPhase("reviewing");
    }
  }

  function nextTurn() {
    setRoundResult(null);

    if (currentPlayerIndex + 1 < players.length) {
      // Next player, same round
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPhase("playing");
    } else {
      // Round complete — show final results
      setPhase("results");
    }
  }

  // Calculate totals for results
  const playerTotals = players.map((name) => ({
    name,
    totalStars: results
      .filter((r) => r.playerName === name)
      .reduce((sum, r) => sum + r.stars, 0),
  }));

  const winner = [...playerTotals].sort(
    (a, b) => b.totalStars - a.totalStars
  )[0];

  // --- SETUP SCREEN ---
  if (phase === "setup") {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black font-headline tracking-tight">
              Play With{" "}
              <span className="bg-gradient-to-r from-tertiary to-[#10b981] bg-clip-text text-transparent">
                Friends
              </span>
            </h1>
            <p className="text-on-surface-variant mt-2">
              Add 2-4 players and pass the device!
            </p>
          </div>

          <div className="space-y-3">
            {players.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayer(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  className="flex-1 px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-tertiary text-on-surface font-medium"
                />
                {players.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="w-12 rounded-lg bg-error-container flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-error text-[20px]">
                      close
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {players.length < 4 && (
            <button
              onClick={addPlayer}
              className="w-full py-3 rounded-lg border-2 border-dashed border-outline-variant text-on-surface-variant font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">
                add
              </span>
              Add Player
            </button>
          )}

          <button
            onClick={startGame}
            disabled={players.filter((p) => p.trim()).length < 2}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-tertiary via-[#06b6d4] to-[#10b981] text-white font-black font-headline text-xl active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            Start Game!
          </button>
        </main>
        <BottomNav />
      </>
    );
  }

  // --- RULES ---
  if (phase === "rules") {
    return (
      <>
        <Header />
        <RulesModal onStart={() => setPhase("playing")} />
      </>
    );
  }

  // --- REVIEWING ---
  if (phase === "reviewing" && roundResult) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-lg mx-auto">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm text-center space-y-6">
            <p className="text-lg font-bold font-headline text-on-surface-variant">
              {players[currentPlayerIndex]}'s Results
            </p>

            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[48px]"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    color:
                      star <= roundResult.stars ? "#f5b830" : "#e3e2e1",
                  }}
                >
                  star
                </span>
              ))}
            </div>

            <p className="text-xl font-bold font-headline text-on-surface">
              {roundResult.message}
            </p>

            {roundResult.tip && (
              <div className="bg-tertiary-container rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">
                    lightbulb
                  </span>
                  Tip: {roundResult.tip}
                </p>
              </div>
            )}

            <button
              onClick={nextTurn}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-xl active:scale-95 transition-all duration-300 shadow-lg"
            >
              {currentPlayerIndex + 1 < players.length
                ? `Pass to ${players[currentPlayerIndex + 1]}`
                : "See Results!"}
            </button>
          </div>
        </main>
      </>
    );
  }

  // --- RESULTS ---
  if (phase === "results") {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-md mx-auto space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm text-center space-y-6">
            <span
              className="material-symbols-outlined text-[64px] text-secondary-fixed-dim"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>

            <h1 className="text-3xl font-black font-headline">
              {winner.name} Wins!
            </h1>

            <div className="space-y-3">
              {playerTotals
                .sort((a, b) => b.totalStars - a.totalStars)
                .map((player, i) => (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                      i === 0
                        ? "bg-secondary-container"
                        : "bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black font-headline text-on-surface-variant">
                        {i + 1}
                      </span>
                      <span className="font-bold font-headline text-on-surface">
                        {player.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{
                          fontVariationSettings: "'FILL' 1",
                          color: "#f5b830",
                        }}
                      >
                        star
                      </span>
                      <span className="font-black font-headline text-on-surface">
                        {player.totalStars}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setPhase("setup");
                  setResults([]);
                  setCurrentPlayerIndex(0);
                  setCurrentRound(0);
                  setRoundResult(null);
                }}
                className="w-full py-3 rounded-xl border-2 border-tertiary text-tertiary font-bold font-headline text-lg active:scale-95 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-tertiary via-[#06b6d4] to-[#10b981] text-white font-black font-headline text-lg active:scale-95 transition-all shadow-lg"
              >
                Back Home
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // --- PLAYING ---
  return (
    <>
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 max-w-lg mx-auto space-y-4">
        <div className="text-center">
          <p className="text-sm font-bold text-tertiary uppercase tracking-widest">
            {players[currentPlayerIndex]}'s Turn
          </p>
          <h1 className="text-2xl font-black font-headline mt-1">
            Draw a {currentLevel.title}!
          </h1>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center mb-3">
            Draw this!
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLevel.referenceImage}
            alt={`Reference drawing of a ${currentLevel.title}`}
            className="w-full max-w-[280px] mx-auto block rounded-lg"
          />
        </div>

        {submitting ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
              progress_activity
            </span>
            <p className="text-lg font-bold font-headline text-on-surface-variant">
              Reviewing your masterpiece...
            </p>
          </div>
        ) : (
          <DrawingCanvas onExport={handleDrawingDone} />
        )}
      </main>
    </>
  );
}
