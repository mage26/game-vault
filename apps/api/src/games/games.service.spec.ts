/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { BadGatewayException } from '@nestjs/common';
import {
  sample_games,
  sample_platforms,
  sample_search,
} from './games.sampledata';

describe('GamesService', () => {
  let service: GamesService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'platformIds') return '1,2,3';
      if (key === 'apiUrl') return 'https://api.igdb.com/v4';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    httpService = module.get<HttpService>(HttpService);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('games()', () => {
    it('should fetch games and return mapped data', async () => {
      mockHttpService.post.mockReturnValue(of({ data: sample_games }));

      const result = await service.games();

      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/games'),
        expect.stringContaining('fields name, cover.url'),
      );

      expect(result[0].name).toBe('RoadCraft');
      expect(result[0].cover).toBe(
        '//images.igdb.com/igdb/image/upload/t_thumb/co9tyt.jpg',
      );
    });
  });

  describe('searchGames()', () => {
    it('should include the search query in the request body', async () => {
      mockHttpService.post.mockReturnValue(of({ data: sample_search }));
      const query = 'Zelda';

      const result = await service.searchGames(query);

      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(`search "${query}"`),
      );
      expect(result[0].name).toBe('The Legend of Zelda');
    });
  });

  describe('platforms()', () => {
    it('should fetch and map platform data correctly', async () => {
      mockHttpService.post.mockReturnValue(of({ data: sample_platforms }));

      const result = await service.platforms();

      expect(result[0].abbreviation).toBe('X360');
      expect(result[0].logo).toBe(
        '//images.igdb.com/igdb/image/upload/t_thumb/plha.jpg',
      );
    });
  });

  describe('apiPost Error Handling', () => {
    it('should throw BadGatewayException when the API fails', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});

      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: { data: 'Invalid API Key' },
        })),
      );

      await expect(service.games()).rejects.toThrow(BadGatewayException);
      expect(loggerSpy).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });
});
