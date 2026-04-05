"use client";

import { use, useState } from "react";
import { getLevelById, getNextLevel } from "@/lib/levels";
import { DrawingCanvas } from "@/components/canvas/drawing-canvas";
import { Header } from "@/components/ui/header";
import { RulesModal } from "@/components/game/rules-modal";
import { useRouter } from "next/navigation";

export default function DrawingPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = use(params);
  const level = getLevelById(levelId);
  const nextLevel = level ? getNextLevel(level.id) : undefined;
  const router = useRouter();
  const [showRules, setShowRules] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    stars: number;
    message: string;
    tip: string | null;
  } | null>(null);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant text-lg">Level not found</p>
      </div>
    );
  }

  async function handleExport(dataUrl: string) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          levelId: level!.id,
          levelTitle: level!.title,
          levelDescription: level!.description,
        }),
      });

      if (!res.ok) throw new Error("Review failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        stars: 1,
        message: "Oops, something went wrong! But great effort — keep drawing!",
        tip: null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Show review screen
  if (result) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-lg mx-auto">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm text-center space-y-6">
            {/* Stars */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[48px]"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    color:
                      star <= result.stars ? "#f5b830" : "#e3e2e1",
                  }}
                >
                  star
                </span>
              ))}
            </div>

            {/* Message */}
            <p className="text-xl font-bold font-headline text-on-surface">
              {result.message}
            </p>

            {/* Tip */}
            {result.tip && (
              <div className="bg-tertiary-container rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">
                    lightbulb
                  </span>
                  Tip: {result.tip}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setResult(null);
                }}
                className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold font-headline text-lg active:scale-95 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() =>
                  router.push(nextLevel ? `/play/${nextLevel.id}` : "/play")
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-lg active:scale-95 transition-all shadow-lg"
              >
                {nextLevel ? "Next Level" : "Back to Levels"}
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {showRules && <RulesModal onStart={() => setShowRules(false)} />}
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 max-w-lg mx-auto space-y-4">
        {/* Level title */}
        <div className="text-center">
          <h1 className="text-2xl font-black font-headline">
            Draw {/^[aeiou]/i.test(level.title) ? "an" : "a"} {level.title}!
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Look at the reference, then draw your best version below
          </p>
        </div>

        {/* Reference image */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center mb-3">
            Draw this!
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={level.referenceImage}
            alt={`Reference drawing of a ${level.title}`}
            className="w-full max-w-[280px] mx-auto block rounded-lg"
          />
        </div>

        {/* Drawing Canvas */}
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
          <DrawingCanvas onExport={handleExport} />
        )}
      </main>
    </>
  );
}
