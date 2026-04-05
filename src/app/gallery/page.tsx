"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { getLevelById } from "@/lib/levels";
import type { User } from "@supabase/supabase-js";

interface Drawing {
  id: string;
  level_id: string;
  stars: number;
  created_at: string;
  storage_path: string;
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className="material-symbols-outlined text-[14px]"
          style={{
            fontVariationSettings: "'FILL' 1",
            color: s <= count ? "#f5b830" : "#c6c6c6",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Drawing | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("drawit_drawings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setDrawings(data);

        // Get signed URLs for all drawings
        const urls: Record<string, string> = {};
        await Promise.all(
          data.map(async (d: Drawing) => {
            const { data: urlData } = await supabase.storage
              .from("drawings")
              .createSignedUrl(d.storage_path, 3600);
            if (urlData?.signedUrl) {
              urls[d.id] = urlData.signedUrl;
            }
          })
        );
        setImageUrls(urls);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
            progress_activity
          </span>
        </main>
        <BottomNav activeTab="gallery" />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
            My{" "}
            <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-on-surface-variant mt-2">
            Every drawing you&apos;ve made, saved forever!
          </p>
        </div>

        {!user ? (
          /* Not logged in — encourage sign up */
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-tertiary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-tertiary text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <p className="text-xl font-bold font-headline text-on-surface">
                Your masterpieces live here!
              </p>
              <p className="text-on-surface-variant mt-1 max-w-xs mx-auto">
                Sign up to save all your drawings and build your very own art
                gallery.
              </p>
            </div>
            <a
              href="/login"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-lg active:scale-95 transition-all duration-300 shadow-lg"
            >
              Sign Up to Start!
            </a>
          </div>
        ) : drawings.length === 0 ? (
          /* Logged in but no drawings yet */
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                palette
              </span>
            </div>
            <div>
              <p className="text-xl font-bold font-headline text-on-surface">
                No drawings yet!
              </p>
              <p className="text-on-surface-variant mt-1">
                Complete a level and your drawings will show up here.
              </p>
            </div>
            <a
              href="/play"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-lg active:scale-95 transition-all duration-300 shadow-lg"
            >
              Start Drawing!
            </a>
          </div>
        ) : (
          /* Drawings grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {drawings.map((drawing, i) => {
              const level = getLevelById(drawing.level_id);
              const url = imageUrls[drawing.id];

              return (
                <button
                  key={drawing.id}
                  onClick={() => setSelected(drawing)}
                  className={`group relative rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer ${
                    i % 3 === 1 ? "translate-y-2" : ""
                  }`}
                >
                  {/* Drawing image */}
                  <div className="aspect-square bg-surface-container flex items-center justify-center">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={level?.title || "Drawing"}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined text-outline text-[40px]"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        image
                      </span>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="p-3">
                    <p className="text-sm font-bold font-headline text-on-surface truncate">
                      {level?.title || drawing.level_id}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <StarRow count={drawing.stars} />
                      <p className="text-[10px] text-on-surface-variant">
                        {new Date(drawing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Drawing detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black font-headline">
                {getLevelById(selected.level_id)?.title || selected.level_id}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="aspect-square bg-surface-container rounded-xl overflow-hidden">
              {imageUrls[selected.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrls[selected.id]}
                  alt="Your drawing"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-[48px]">
                    image
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <StarRow count={selected.stars} />
              <p className="text-sm text-on-surface-variant">
                {new Date(selected.created_at).toLocaleDateString()}
              </p>
            </div>

            <a
              href={`/play/${selected.level_id}`}
              className="block w-full py-3 text-center rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-lg active:scale-95 transition-all duration-300 shadow-lg"
            >
              Draw Again!
            </a>
          </div>
        </div>
      )}

      <BottomNav activeTab="gallery" />
    </>
  );
}
