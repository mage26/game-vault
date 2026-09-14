"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = new FormData(e.currentTarget).get("q") as string;
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => router.push(`/?${params.toString()}`));
    },
    [router, searchParams],
  );

  const currentQuery = searchParams.get("q") ?? "";

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        name="q"
        type="search"
        defaultValue={currentQuery}
        placeholder="Search games…"
        className="flex-1 rounded-lg border border-(--border) bg-(--surface) px-4 py-2 text-sm text-(--text) placeholder:text-(--muted) focus:border-(--accent) focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-(--accent) px-4 py-2 text-sm text-(--accent) hover:bg-(--accent) hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
