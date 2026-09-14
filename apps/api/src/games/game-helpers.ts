export type IGDBGameType = {
  id: number;
  name: string;
  url: string;
  summary: string;
  cover: {
    id: string;
    url: string;
  };
  platforms: {
    id: string;
    abbreviation: string;
  }[];
  release_dates: {
    id: string;
    human: string;
    platform: {
      abbreviation: string;
    };
  }[];
  first_release_date?: number;
};

export type IGDBPlatformType = {
  id: number;
  abbreviation: string;
  generation: number;
  name: string;
  platform_logo: {
    id: number;
    url: string;
  };
};

export function mapGames(games: IGDBGameType[]) {
  return games.map((game) => ({
    id: game.id,
    name: game.name,
    url: game.url,
    summary: game.summary,
    cover: game.cover && game.cover.url ? game.cover.url : null,
    platforms: game.platforms.map(({ abbreviation }) => abbreviation),
    releaseDates: game.release_dates.map(
      ({ human, platform }) => `${platform.abbreviation}: ${human}`,
    ),
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
      : null,
  }));
}

export function mapPlatforms(platforms: IGDBPlatformType[]) {
  return platforms.map((platform) => ({
    id: platform.id,
    abbreviation: platform.abbreviation,
    generation: platform.generation,
    name: platform.name,
    logo:
      platform.platform_logo && platform.platform_logo.url
        ? platform.platform_logo.url
        : null,
  }));
}
