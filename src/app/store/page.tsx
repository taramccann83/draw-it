"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useRouter } from "next/navigation";

interface StoreItem {
  id: string;
  name: string;
  category: "brush" | "avatar" | "palette";
  cost_stars: number;
  description: string;
  icon: string;
  colors?: string[]; // for palette previews
}

const STORE_ITEMS: StoreItem[] = [
  // Brushes
  {
    id: "brush-glitter",
    name: "Glitter Brush",
    category: "brush",
    cost_stars: 5,
    description: "Sparkly and fun!",
    icon: "auto_awesome",
  },
  {
    id: "brush-marker",
    name: "Thick Marker",
    category: "brush",
    cost_stars: 5,
    description: "Bold and bright strokes",
    icon: "edit",
  },
  {
    id: "brush-crayon",
    name: "Crayon",
    category: "brush",
    cost_stars: 10,
    description: "Classic crayon texture",
    icon: "draw",
  },
  // Avatars
  {
    id: "avatar-cat",
    name: "Cat Avatar",
    category: "avatar",
    cost_stars: 5,
    description: "Meow!",
    icon: "pets",
  },
  {
    id: "avatar-robot",
    name: "Robot Avatar",
    category: "avatar",
    cost_stars: 5,
    description: "Beep boop!",
    icon: "smart_toy",
  },
  {
    id: "avatar-astronaut",
    name: "Astronaut Avatar",
    category: "avatar",
    cost_stars: 10,
    description: "To the stars!",
    icon: "rocket_launch",
  },
  // Palettes
  {
    id: "palette-neon",
    name: "Neon Pack",
    category: "palette",
    cost_stars: 8,
    description: "Bright neon colors",
    icon: "palette",
    colors: ["#ff006e", "#8338ec", "#3a86ff", "#06d6a0", "#ffbe0b"],
  },
  {
    id: "palette-pastel",
    name: "Pastel Pack",
    category: "palette",
    cost_stars: 8,
    description: "Soft and dreamy",
    icon: "palette",
    colors: ["#ffb3c6", "#c8b6ff", "#b8e0ff", "#b7e4c7", "#fde8a8"],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  brush: "Brushes",
  avatar: "Avatars",
  palette: "Color Packs",
};

const CATEGORY_ORDER = ["brush", "avatar", "palette"];

export default function StorePage() {
  const router = useRouter();
  const supabase = createClient();
  const [totalStars, setTotalStars] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("drawit_profiles")
        .select("total_stars")
        .eq("id", user.id)
        .single();

      if (profile) setTotalStars(profile.total_stars ?? 0);

      const { data: items } = await supabase
        .from("drawit_user_items")
        .select("item_id")
        .eq("user_id", user.id);

      if (items) setOwnedItems(items.map((i: { item_id: string }) => i.item_id));

      setLoading(false);
    }

    load();
  }, []);

  async function handleBuy(item: StoreItem) {
    if (buying) return;
    if (totalStars < item.cost_stars) {
      setMessage("Not enough stars! Keep drawing to earn more.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setBuying(item.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Deduct stars
    const newStars = totalStars - item.cost_stars;
    await supabase
      .from("drawit_profiles")
      .update({ total_stars: newStars })
      .eq("id", user.id);

    // Add item
    await supabase
      .from("drawit_user_items")
      .insert({ user_id: user.id, item_id: item.id });

    setTotalStars(newStars);
    setOwnedItems((prev) => [...prev, item.id]);
    setMessage(`You unlocked ${item.name}!`);
    setTimeout(() => setMessage(""), 3000);
    setBuying(null);
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
            progress_activity
          </span>
        </main>
        <BottomNav activeTab="store" />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
            The{" "}
            <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
              Store
            </span>
          </h1>
          <p className="text-on-surface-variant mt-2">
            Spend your stars to unlock cool stuff!
          </p>
        </div>

        {/* Star balance */}
        <div className="bg-secondary-container rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-on-secondary-container uppercase tracking-widest">
              Your Stars
            </p>
            <p className="text-4xl font-black font-headline text-on-secondary-container mt-1">
              {totalStars}
            </p>
          </div>
          <span
            className="material-symbols-outlined text-[64px]"
            style={{ fontVariationSettings: "'FILL' 1", color: "#f5b830" }}
          >
            star
          </span>
        </div>

        {/* Toast message */}
        {message && (
          <div className="bg-tertiary-container rounded-xl p-4 text-center animate-slide-up">
            <p className="font-bold text-on-tertiary-container">{message}</p>
          </div>
        )}

        {/* Items by category */}
        {CATEGORY_ORDER.map((cat) => {
          const items = STORE_ITEMS.filter((i) => i.category === cat);
          return (
            <section key={cat} className="space-y-4">
              <h2 className="text-xl font-extrabold font-headline">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => {
                  const owned = ownedItems.includes(item.id);
                  const canAfford = totalStars >= item.cost_stars;

                  return (
                    <div
                      key={item.id}
                      className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col items-center gap-3 transition-all duration-300 ${
                        owned ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      {/* Icon / palette preview */}
                      {item.colors ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden grid grid-cols-5">
                          {item.colors.map((c) => (
                            <div key={c} style={{ backgroundColor: c }} className="h-full" />
                          ))}
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          owned ? "bg-primary-container" : "bg-surface-container"
                        }`}>
                          <span
                            className="material-symbols-outlined text-[32px]"
                            style={{
                              fontVariationSettings: "'FILL' 1",
                              color: owned ? "#bb0056" : "#474747",
                            }}
                          >
                            {item.icon}
                          </span>
                        </div>
                      )}

                      {/* Name + description */}
                      <div className="text-center">
                        <p className="font-bold font-headline text-on-surface text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Buy / Owned button */}
                      {owned ? (
                        <div className="w-full py-2 rounded-lg bg-primary-container flex items-center justify-center gap-1">
                          <span
                            className="material-symbols-outlined text-primary text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          <span className="text-xs font-bold text-primary">Owned</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={buying === item.id || !canAfford}
                          className={`w-full py-2 rounded-lg font-bold font-headline text-sm flex items-center justify-center gap-1 active:scale-95 transition-all duration-300 ${
                            canAfford
                              ? "bg-gradient-to-r from-primary to-secondary-fixed-dim text-white shadow-sm"
                              : "bg-surface-container text-on-surface-variant"
                          } disabled:opacity-60`}
                        >
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          {buying === item.id ? "..." : item.cost_stars}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Earn more stars CTA */}
        <div className="bg-tertiary-container rounded-2xl p-6 text-center space-y-3">
          <p className="font-extrabold font-headline text-on-tertiary-container text-lg">
            Need more stars?
          </p>
          <p className="text-sm text-on-tertiary-container">
            Complete levels and get great scores to earn stars!
          </p>
          <a
            href="/play"
            className="inline-block px-8 py-3 rounded-xl bg-tertiary text-white font-black font-headline text-lg active:scale-95 transition-all duration-300 shadow-lg"
          >
            Go Draw!
          </a>
        </div>
      </main>
      <BottomNav activeTab="store" />
    </>
  );
}
