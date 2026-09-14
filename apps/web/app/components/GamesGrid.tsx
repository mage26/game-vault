"use client";

import { useState, useEffect } from "react";
import type { MappedGame } from "@game-vault/types";
import { useFavorites } from "../hooks/useFavorites";
import { fetchGamesByIds } from "@/lib/api";
import GameCard from "./GameCard";

interface Props {
  games: MappedGame[];
  platform?: string;
}

export default function GamesGrid({ games, platform }: Props) {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState<MappedGame[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const favoriteIdsKey = [...favorites].sort((a, b) => a - b).join(",");

  useEffect(() => {
    if (!showFavoritesOnly) return;
    if (!favoriteIdsKey) {
      setFavoriteGames([]);
      return;
    }

    setIsLoadingFavorites(true);
    fetchGamesByIds(favoriteIdsKey.split(",").map(Number), platform)
      .then(setFavoriteGames)
      .catch(() => setFavoriteGames([]))
      .finally(() => setIsLoadingFavorites(false));
  }, [showFavoritesOnly, favoriteIdsKey, platform]);

  const displayed = showFavoritesOnly ? favoriteGames : games;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--muted)">
          {isLoadingFavorites ? "" : `${displayed.length} games`}
        </p>
        <button
          onClick={() => setShowFavoritesOnly((v) => !v)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            showFavoritesOnly
              ? "border-yellow-400 text-yellow-400"
              : "border-(--border) text-(--muted) hover:border-yellow-400 hover:text-yellow-400"
          }`}
        >
          ★{" "}
          {showFavoritesOnly
            ? "Show All Games"
            : `Show Favorites (${favorites.size})`}
        </button>
      </div>

      {isLoadingFavorites ? (
        <p className="text-(--muted)">Loading favorites…</p>
      ) : displayed.length === 0 ? (
        <p className="text-(--muted)">
          {showFavoritesOnly ? "No favorites yet." : "No games found."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayed.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={isFavorite(game.id)}
              onToggleFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
