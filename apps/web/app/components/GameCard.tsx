"use client";

import Image from "next/image";
import type { MappedGame } from "@game-vault/types";

interface Props {
  game: MappedGame;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function GameCard({
  game,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <article className="relative flex flex-col rounded-lg overflow-hidden bg-(--surface) border border-(--border) hover:border-(--accent) transition-colors">
      <button
        onClick={onToggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full text-base backdrop-blur-sm transition-colors ${
          isFavorite
            ? "text-yellow-400 bg-black/40"
            : "text-white/40 bg-black/30 hover:text-yellow-400"
        }`}
      >
        ★
      </button>

      <div className="relative aspect-[3/4] bg-[var(--border)]">
        {game.cover ? (
          <Image
            src={`https://${game.cover.replace("t_thumb", "t_cover_big")}`}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-sm">
            No cover
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1">
        <h2 className="font-semibold text-sm leading-tight line-clamp-2 text-[var(--text)]">
          {game.name}
        </h2>
        {game.releaseDate && (
          <p className="text-xs text-[var(--muted)]">
            {new Date(game.releaseDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}

        {game.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.platforms.slice(0, 3).map((p) => (
              <span
                key={p}
                className="text-xs px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted)]"
              >
                {p}
              </span>
            ))}
            {game.platforms.length > 3 && (
              <span className="text-xs text-[var(--muted)]">
                +{game.platforms.length - 3}
              </span>
            )}
          </div>
        )}

        {game.summary && (
          <p className="text-xs text-[var(--muted)] line-clamp-3 mt-auto">
            {game.summary}
          </p>
        )}
      </div>
    </article>
  );
}
