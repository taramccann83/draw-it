"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { levels } from "@/lib/levels";
import { useRouter } from "next/navigation";

const AVATAR_OPTIONS = [
  { icon: "person", label: "Person" },
  { icon: "face", label: "Face" },
  { icon: "pets", label: "Cat" },
  { icon: "cruelty_free", label: "Bunny" },
  { icon: "mood", label: "Smiley" },
  { icon: "star", label: "Star" },
  { icon: "palette", label: "Palette" },
  { icon: "brush", label: "Brush" },
  { icon: "rocket_launch", label: "Rocket" },
  { icon: "favorite", label: "Heart" },
  { icon: "local_florist", label: "Flower" },
  { icon: "music_note", label: "Music" },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarIcon, setAvatarIcon] = useState("person");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setNewEmail(user.email || "");

      // Try to get profile, create if doesn't exist
      let { data: profileData } = await supabase
        .from("drawit_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        const { data: newProfile } = await supabase
          .from("drawit_profiles")
          .insert({
            id: user.id,
            display_name: user.email?.split("@")[0] || "Artist",
            avatar_url: "person",
          })
          .select()
          .single();
        profileData = newProfile;
      }

      setProfile(profileData);
      setDisplayName(profileData?.display_name || "");
      setAvatarIcon(profileData?.avatar_url || "person");
      setLoading(false);
    }

    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    // Update profile
    await supabase
      .from("drawit_profiles")
      .update({
        display_name: displayName,
        avatar_url: avatarIcon,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Update email if changed
    if (newEmail !== user.email) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
      setMessage("Check your new email for a confirmation link!");
    }

    setProfile({
      ...profile,
      display_name: displayName,
      avatar_url: avatarIcon,
    });
    setEditing(false);
    setSaving(false);
    if (!message) setMessage("Profile updated!");
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-40 px-4 sm:px-6 max-w-md mx-auto flex items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
            progress_activity
          </span>
        </main>
      </>
    );
  }

  const totalStars = profile?.total_stars ?? 0;
  const totalLevels = levels.length;
  const currentAvatar = editing ? avatarIcon : (profile?.avatar_url || "person");

  return (
    <>
      <Header />
      <main className="pt-24 pb-40 px-4 sm:px-6 max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm text-center space-y-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary-container border-3 border-primary mx-auto flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {currentAvatar}
            </span>
          </div>

          {editing ? (
            <div className="space-y-4 text-left">
              {/* Avatar Picker */}
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.icon}
                      onClick={() => setAvatarIcon(opt.icon)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        avatarIcon === opt.icon
                          ? "bg-primary-container border-2 border-primary scale-110"
                          : "bg-surface-container border border-outline-variant"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {opt.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                />
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(profile?.display_name || "");
                    setAvatarIcon(profile?.avatar_url || "person");
                    setNewEmail(user?.email || "");
                  }}
                  className="flex-1 py-3 rounded-lg border-2 border-outline-variant text-on-surface-variant font-bold font-headline active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-bold font-headline active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-black font-headline">
                  {profile?.display_name || "Artist"}
                </h1>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Status message */}
        {message && (
          <div className="bg-tertiary-container rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-on-tertiary-container">
              {message}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary-container rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  color: "#f5b830",
                }}
              >
                star
              </span>
              <span className="text-2xl font-black font-headline text-on-secondary-container">
                {totalStars}
              </span>
            </div>
            <p className="text-xs font-semibold text-on-secondary-container mt-1">
              Total Stars
            </p>
          </div>

          <div className="bg-tertiary-container rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-headline text-on-tertiary-container">
              0
            </span>
            <p className="text-xs font-semibold text-on-tertiary-container mt-1">
              Completed
            </p>
          </div>

          <div className="bg-primary-container rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-headline text-on-primary-container">
              {totalLevels}
            </span>
            <p className="text-xs font-semibold text-on-primary-container mt-1">
              Total Levels
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold font-headline">
            Level Progress
          </h2>

          <div className="space-y-2">
            {["easy", "medium", "hard"].map((diff) => {
              const count = levels.filter((l) => l.difficulty === diff).length;
              return (
                <div key={diff} className="flex items-center gap-3">
                  <span className="text-sm font-bold capitalize text-on-surface-variant w-16">
                    {diff}
                  </span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        diff === "easy"
                          ? "bg-tertiary"
                          : diff === "medium"
                          ? "bg-secondary"
                          : "bg-primary"
                      }`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    0/{count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl border-2 border-error text-error font-bold font-headline text-lg active:scale-95 transition-all"
        >
          Sign Out
        </button>
      </main>
      <BottomNav />
    </>
  );
}
