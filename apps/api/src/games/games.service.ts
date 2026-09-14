import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  IGDBGameType,
  IGDBPlatformType,
  mapGames,
  mapPlatforms,
} from './game-helpers';

const GAME_FIELDS =
  'name, cover.url, url, release_dates.human, release_dates.platform.abbreviation, summary, platforms.abbreviation, aggregated_rating, first_release_date';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async games(platform?: string) {
    const platformIds = this.configService.get<string>('platformIds');
    const body = `fields ${GAME_FIELDS}; where parent_game = null & game_type = 0 & platforms = (${platform ?? platformIds}) & first_release_date <= 1787072178; sort first_release_date desc;`; // sort aggregated_rating desc;`;
    const data = await this.apiPost<IGDBGameType[]>('games', body);
    return mapGames(data);
  }

  async searchGames(query: string, platform?: string) {
    const platformIds = this.configService.get<string>('platformIds');
    const body = `fields ${GAME_FIELDS}; search "${query}"; where platforms = (${platform ?? platformIds}) & game_type = 0;`;
    const data = await this.apiPost<IGDBGameType[]>('games', body);
    return mapGames(data);
  }

  async gamesByIds(ids: number[], platform?: string) {
    const platformClause = platform ? ` & platforms = (${platform})` : '';
    const body = `fields ${GAME_FIELDS}; where id = (${ids.join(',')})${platformClause}; limit ${ids.length};`;
    const data = await this.apiPost<IGDBGameType[]>('games', body);
    return mapGames(data);
  }

  async platforms() {
    const platformIds = this.configService.get<string>('platformIds');
    const body = `fields name, abbreviation, platform_logo.url, generation; where id = (${platformIds}); limit 21;`;
    const data = await this.apiPost<IGDBPlatformType[]>('platforms', body);
    return mapPlatforms(data);
  }

  private async apiPost<T>(endpoint: string, body: string): Promise<T> {
    const apiUrl = this.configService.get<string>('apiUrl');
    return firstValueFrom(
      this.httpService.post<T>(`${apiUrl}/${endpoint}`, body).pipe(
        map((res) => res.data),
        catchError((err) => {
          this.logger.error(`IGDB API Fail: ${apiUrl}/${endpoint}`, err);
          throw new BadGatewayException('External API Error');
        }),
      ),
    );
  }
}
