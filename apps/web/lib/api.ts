import type { MappedGame, MappedPlatform } from '@game-vault/types';

// Same Vercel deployment serves both apps, so the API is reachable at /api on
// this project's own domain (VERCEL_URL) unless API_URL overrides it, e.g. to
// point at a separately-deployed API.
const API_URL =
  process.env.API_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : 'http://localhost:3000/api');

export async function fetchGames(platformId?: string): Promise<MappedGame[]> {
  const url = new URL(`${API_URL}/games/games`);
  if (platformId) url.searchParams.set('platform', platformId);
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch games');
  return res.json();
}

export async function fetchPlatforms(): Promise<MappedPlatform[]> {
  const res = await fetch(`${API_URL}/games/platforms`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch platforms');
  return res.json();
}

export async function fetchGamesByIds(ids: number[], platform?: string): Promise<MappedGame[]> {
  if (ids.length === 0) return [];
  const url = new URL(`${API_URL}/games/by-ids`);
  url.searchParams.set('ids', ids.join(','));
  if (platform) url.searchParams.set('platform', platform);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch games by IDs');
  return res.json();
}

export async function searchGames(query: string, platform?: string): Promise<MappedGame[]> {
  const url = new URL(`${API_URL}/games/search`);
  url.searchParams.set('q', query);
  if (platform) url.searchParams.set('platform', platform);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to search games');
  return res.json();
}
