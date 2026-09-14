'use client';

import { useState, useEffect } from 'react';

const KEY = 'game-vault:favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setFavorites(new Set(JSON.parse(stored) as number[]));
    } catch {}
  }, []);

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite: (id: number) => favorites.has(id),
  };
}
