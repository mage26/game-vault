import {
  Injectable,
  Inject,
  HttpException,
  RequestTimeoutException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { firstValueFrom, catchError, throwError, TimeoutError } from 'rxjs';
import { ConfigService } from '@nestjs/config';

type AccessTokenType = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type HeadersType = {
  'Client-ID': string;
  Authorization: string;
  Accept: 'application/json';
};

@Injectable()
export class IgdbAuthService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAccessToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>('igdb_token');
    if (cachedToken) return cachedToken;

    const response: { data: AccessTokenType } = await firstValueFrom(
      this.httpService
        .post('https://id.twitch.tv/oauth2/token', null, {
          params: {
            client_id: this.configService.get<string>('clientId'),
            client_secret: this.configService.get<string>('clientSecret'),
            grant_type: 'client_credentials',
          },
        })
        .pipe(
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new RequestTimeoutException());
            }

            if (err instanceof HttpException) {
              return throwError(() => err);
            }

            return throwError(
              () =>
                new HttpException(
                  'Internal Server Error',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            );
          }),
        ),
    );

    await this.cacheManager.set(
      'igdb_token',
      response.data.access_token,
      (response.data.expires_in - 60) * 1000,
    );

    return response.data.access_token;
  }

  async getAccessHeaders(): Promise<HeadersType> {
    const token = await this.getAccessToken();

    return {
      'Client-ID': process.env.IGDB_CLIENT_ID || '',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
  }
}
