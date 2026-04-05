"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#faf9f8]/80 backdrop-blur-xl shadow-[0_4px_40px_rgba(26,28,28,0.04)]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + App Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Draw It! logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-xl font-black font-headline tracking-tight">
            Draw{" "}
            <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
              It!
            </span>
          </span>
        </Link>

        {/* Avatar — links to profile or login */}
        <Link
          href={isLoggedIn ? "/profile" : "/login"}
          className="w-10 h-10 rounded-full bg-secondary-container border-2 border-primary flex items-center justify-center overflow-hidden active:scale-90 transition-transform"
        >
          <span
            className="material-symbols-outlined text-on-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </Link>
      </div>
    </header>
  );
}
