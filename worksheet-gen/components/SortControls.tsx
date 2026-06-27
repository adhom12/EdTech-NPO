"use client";

import { useRouter, usePathname } from "next/navigation";

interface SortControlsProps {
  count: number;
  currentSort: string;
}

export function SortControls({ count, currentSort }: SortControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(value: string) {
    if (value === "newest") {
      router.replace(pathname, { scroll: false });
    } else {
      router.replace(`${pathname}?sort=${value}`, { scroll: false });
    }
  }

  return (
    <div className="flex items-center justify-between mb-5">
      <h2
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#9AA0A6" }}
      >
        Question Sets &middot; {count}
      </h2>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
        style={{
          backgroundColor: "#1E2024",
          border: "1px solid #2C2E33",
          color: "#9AA0A6",
        }}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>
    </div>
  );
}
