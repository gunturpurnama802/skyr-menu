"use client";

type Props = {
  active: string;
  onChange: (cat: string) => void;
  categories: string[];
};

export default function CategoryFilter({ active, onChange, categories }: Props) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto scrollbar-none"
      style={{ scrollbarWidth: "none" }}
      role="tablist"
      aria-label="Filter kategori"
    >
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition active:scale-[0.97] sm:px-5 sm:py-2.5 sm:text-sm ${
              isActive
                ? "bg-[#0061a6] text-white shadow-md"
                : "bg-white text-[#1f2937] border border-black/5 shadow-sm hover:bg-white"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
