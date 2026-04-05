import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import Image from "next/image";
import { levels } from "@/lib/levels";

const difficultyColors: Record<string, string> = {
  easy: "bg-tertiary-container text-on-tertiary-container",
  medium: "bg-secondary-container text-on-secondary-container",
  hard: "bg-primary-container text-on-primary-container",
};

// Show a mix of levels as a preview
const previewLevels = [
  levels[0], // Ice Cream (easy)
  levels[7], // Cat (medium)
  levels[2], // Rainbow (easy)
  levels[13], // Robot (hard)
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <section className="group bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/logo.png"
              alt="Draw It! logo"
              width={192}
              height={192}
              className="group-hover:rotate-0 rotate-2 transition-transform duration-500"
              priority
            />
            <h1 className="text-4xl md:text-5xl font-black font-headline leading-tight tracking-tight">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
                Create
              </span>
              ?
            </h1>
            <p className="text-lg leading-relaxed text-on-surface-variant max-w-md">
              Grab your digital brush and let your imagination run wild. Every
              stroke is a masterpiece waiting to happen!
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-3">
          {/* Play Solo */}
          <a
            href="/play"
            className="relative group block h-44 rounded-xl overflow-hidden active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#d946ef] to-[#8b5cf6] p-[3px] rounded-xl">
              <div className="w-full h-full bg-surface-container-lowest rounded-[calc(0.75rem-2px)] flex flex-col items-center justify-center gap-3 transition-colors group-hover:bg-transparent">
                <span
                  className="material-symbols-outlined text-primary text-[36px] group-hover:text-white transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
                <span className="text-lg font-black font-headline text-on-surface group-hover:text-white transition-colors">
                  PLAY SOLO
                </span>
              </div>
            </div>
          </a>

          {/* Play With Friends */}
          <a
            href="/multiplayer"
            className="relative group block h-44 rounded-xl overflow-hidden active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary via-[#06b6d4] to-[#10b981] p-[3px] rounded-xl">
              <div className="w-full h-full bg-surface-container-lowest rounded-[calc(0.75rem-2px)] flex flex-col items-center justify-center gap-3 transition-colors group-hover:bg-transparent">
                <span
                  className="material-symbols-outlined text-tertiary text-[36px] group-hover:text-white transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                <span className="text-lg font-black font-headline text-on-surface group-hover:text-white transition-colors text-center leading-tight">
                  PLAY WITH FRIENDS
                </span>
              </div>
            </div>
          </a>
        </section>

        {/* What Can You Draw? */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-extrabold font-headline">
              What Can You Draw?
            </h2>
            <a
              href="/play"
              className="text-primary font-semibold text-sm hover:underline"
            >
              See All Levels
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previewLevels.map((level, i) => (
              <a
                key={level.id}
                href={`/play/${level.id}`}
                className={`group rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 ${
                  i % 2 === 1 ? "translate-y-4" : ""
                }`}
              >
                <div className="aspect-square bg-surface-container flex items-center justify-center p-4">
                  <Image
                    src={level.referenceImage}
                    alt={level.title}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold font-headline text-on-surface truncate">
                    {level.title}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      difficultyColors[level.difficulty]
                    }`}
                  >
                    {level.difficulty}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
