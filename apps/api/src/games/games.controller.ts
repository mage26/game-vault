import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('games')
  async games(@Query('platform') platform?: string) {
    return await this.gamesService.games(platform);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('platform') platform?: string,
  ) {
    if (!query) return [];

    return await this.gamesService.searchGames(query, platform);
  }

  @Get('by-ids')
  async byIds(@Query('ids') ids: string, @Query('platform') platform?: string) {
    if (!ids) return [];
    const idList = ids.split(',').map(Number).filter(Boolean);
    if (idList.length === 0) return [];
    return await this.gamesService.gamesByIds(idList, platform);
  }

  @Get('platforms')
  async platforms() {
    return await this.gamesService.platforms();
  }
}
