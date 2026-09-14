import { Module, OnModuleInit } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { IgdbAuthModule } from 'src/igdb-auth/igdb-auth.module';
import { IgdbAuthService } from 'src/igdb-auth/igdb-auth.service';

@Module({
  imports: [HttpModule, IgdbAuthModule],
  providers: [GamesService],
  controllers: [GamesController],
})
export class GamesModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly authService: IgdbAuthService,
  ) {}

  onModuleInit() {
    const axios = this.httpService.axiosRef;

    axios.interceptors.request.use(async (config) => {
      const authHeaders = await this.authService.getAccessHeaders();
      config.headers['Client-ID'] = authHeaders['Client-ID'];
      config.headers['Authorization'] = authHeaders.Authorization;
      config.headers['Accept'] = 'application/json';
      return config;
    });
  }
}
