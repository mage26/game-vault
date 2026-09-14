export interface MappedGame {
  id: number;
  name: string;
  url: string;
  summary: string;
  cover: string | null;
  platforms: string[];
  releaseDates: string[];
  releaseDate: string | null;
}

export interface MappedPlatform {
  id: number;
  abbreviation: string;
  generation: number;
  name: string;
  logo: string | null;
}
