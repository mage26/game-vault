import { Suspense } from 'react';
import { fetchGames, fetchPlatforms, searchGames } from '@/lib/api';
import GamesGrid from './components/GamesGrid';
import PlatformFilter from './components/PlatformFilter';
import SearchBar from './components/SearchBar';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; q?: string }>;
}) {
  const { platform, q } = await searchParams;
  const [games, platforms] = await Promise.all([
    q ? searchGames(q, platform) : fetchGames(platform),
    fetchPlatforms(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <PlatformFilter platforms={platforms} />
      </Suspense>

      <Suspense>
        <SearchBar />
      </Suspense>

      <GamesGrid games={games} platform={platform} />
    </div>
  );
}
