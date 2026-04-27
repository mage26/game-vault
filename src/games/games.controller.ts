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
  async search(@Query('q') query: string) {
    if (!query) return [];

    return await this.gamesService.searchGames(query);
  }

  @Get('platforms')
  async platforms() {
    return await this.gamesService.platforms();
  }
}
