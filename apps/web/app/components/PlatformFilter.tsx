'use client';

import type { MappedPlatform } from '@game-vault/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PlatformFilter({ platforms }: { platforms: MappedPlatform[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get('platform') ?? '';

  function handleChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('platform', id);
    } else {
      params.delete('platform');
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleChange('')}
        className={`text-sm px-3 py-1 rounded-full border transition-colors ${
          selected === ''
            ? 'border-[var(--accent)] text-[var(--accent)]'
            : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
        }`}
      >
        All
      </button>
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => handleChange(String(p.id))}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            selected === String(p.id)
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
          }`}
        >
          {p.abbreviation || p.name}
        </button>
      ))}
    </div>
  );
}
