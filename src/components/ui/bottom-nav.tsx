"use client";

const navItems = [
  { icon: "home", label: "Home", href: "/", tab: "home" },
  { icon: "palette", label: "Gallery", href: "/gallery", tab: "gallery" },
  { icon: "shopping_bag", label: "Store", href: "/store", tab: "store" },
];

interface BottomNavProps {
  activeTab?: "home" | "gallery" | "store";
}

export function BottomNav({ activeTab = "home" }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white/80 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(26,28,28,0.04)] rounded-t-[3rem] pb-6 pt-2">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <a
              key={item.icon}
              href={item.href}
              className={`flex flex-col items-center gap-1 active:scale-90 transition-transform duration-300 ${
                isActive ? "-translate-y-2" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center ${
                  isActive
                    ? "bg-gradient-to-br from-primary to-secondary-fixed-dim text-white rounded-full p-3 shadow-lg scale-110"
                    : "p-3 text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
