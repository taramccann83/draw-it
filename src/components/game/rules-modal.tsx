"use client";

interface RulesModalProps {
  onStart: () => void;
}

const rules = [
  {
    icon: "visibility_off",
    title: "No cheating!",
    text: "Don't look at a photo — use your brain and your skills.",
  },
  {
    icon: "front_hand",
    title: "No passing!",
    text: "If it's hard, that's the point. You have to try your best — no switching to someone else.",
  },
  {
    icon: "thumb_up",
    title: "Be confident!",
    text: "Your drawing doesn't have to be perfect. Believe in yourself!",
  },
];

export function RulesModal({ onStart }: RulesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md space-y-6 animate-slide-up">
        <h2 className="text-2xl font-black font-headline text-center">
          Game Rules
        </h2>

        <div className="space-y-4">
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-primary text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {rule.icon}
                </span>
              </div>
              <div>
                <p className="font-bold font-headline text-on-surface">
                  {rule.title}
                </p>
                <p className="text-sm text-on-surface-variant">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-xl active:scale-95 transition-all duration-300 shadow-lg"
        >
          Let's Draw!
        </button>
      </div>
    </div>
  );
}
