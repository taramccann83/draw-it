import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <section className="group bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Hero illustration placeholder */}
            <div className="w-48 h-48 rounded-full bg-primary-container flex items-center justify-center group-hover:rotate-0 rotate-2 transition-transform duration-500">
              <span
                className="material-symbols-outlined text-primary text-[80px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                brush
              </span>
            </div>
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
        <section className="space-y-4">
          {/* Play Solo */}
          <a
            href="/play"
            className="relative group block h-44 rounded-xl overflow-hidden active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#d946ef] to-[#8b5cf6] p-[3px] rounded-xl">
              <div className="w-full h-full bg-surface-container-lowest rounded-[calc(0.75rem-2px)] flex flex-col items-center justify-center gap-3 transition-colors group-hover:bg-transparent">
                <span
                  className="material-symbols-outlined text-primary text-[48px] group-hover:text-white transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
                <span className="text-2xl font-black font-headline text-on-surface group-hover:text-white transition-colors">
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
                  className="material-symbols-outlined text-tertiary text-[48px] group-hover:text-white transition-colors"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                <span className="text-2xl font-black font-headline text-on-surface group-hover:text-white transition-colors">
                  PLAY WITH FRIENDS
                </span>
              </div>
            </div>
          </a>
        </section>

        {/* Community Favorites */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-extrabold font-headline">
              Community Favorites
            </h2>
            <a
              href="/gallery"
              className="text-primary font-semibold text-sm hover:underline"
            >
              See Gallery
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { bg: "bg-primary-container", icon: "pets" },
              { bg: "bg-tertiary-container", icon: "directions_car" },
              { bg: "bg-secondary-container", icon: "headphones" },
              { bg: "bg-surface-container-high", icon: "star" },
            ].map((item, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg overflow-hidden ${
                  item.bg
                } flex items-center justify-center hover:shadow-md transition-shadow ${
                  i % 2 === 1 ? "translate-y-4" : ""
                }`}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
                  {item.icon}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
