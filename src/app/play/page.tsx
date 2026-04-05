import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { levels, type Difficulty } from "@/lib/levels";
import Link from "next/link";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-tertiary-container text-on-tertiary-container",
  medium: "bg-secondary-container text-on-secondary-container",
  hard: "bg-primary-container text-on-primary-container",
};

const difficultyIcons: Record<Difficulty, string> = {
  easy: "star",
  medium: "star star",
  hard: "star star star",
};

export default function LevelSelectPage() {
  // Group levels by difficulty
  const easy = levels.filter((l) => l.difficulty === "easy");
  const medium = levels.filter((l) => l.difficulty === "medium");
  const hard = levels.filter((l) => l.difficulty === "hard");

  const sections = [
    { title: "Easy", levels: easy, difficulty: "easy" as Difficulty },
    { title: "Medium", levels: medium, difficulty: "medium" as Difficulty },
    { title: "Hard", levels: hard, difficulty: "hard" as Difficulty },
  ];

  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
            Choose a{" "}
            <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
              Level
            </span>
          </h1>
          <p className="text-on-surface-variant mt-2">
            Complete each level to unlock the next one!
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.difficulty}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-extrabold font-headline">
                {section.title}
              </h2>
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                  difficultyColors[section.difficulty]
                }`}
              >
                {section.difficulty}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {section.levels.map((level, i) => {
                // For now, first level unlocked, rest locked (will be dynamic with auth)
                const isUnlocked = level.order === 1;

                return (
                  <Link
                    key={level.id}
                    href={isUnlocked ? `/play/${level.id}` : "#"}
                    className={`relative group rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                      isUnlocked
                        ? "bg-surface-container-lowest shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                        : "bg-surface-container opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Lock icon for locked levels */}
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">
                          lock
                        </span>
                      </div>
                    )}

                    {/* Level icon placeholder */}
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                        difficultyColors[level.difficulty]
                      }`}
                    >
                      <span className="text-2xl font-black font-headline">
                        {level.order}
                      </span>
                    </div>

                    {/* Level title */}
                    <span className="text-sm font-bold font-headline text-on-surface text-center">
                      {level.title}
                    </span>

                    {/* Stars placeholder */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[16px] text-outline-variant"
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <BottomNav />
    </>
  );
}
