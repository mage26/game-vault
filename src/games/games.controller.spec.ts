/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import {
  sample_games,
  sample_platforms,
  sample_search,
} from './games.sampledata';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  const mockGamesService = {
    games: jest.fn().mockResolvedValue(sample_games),
    searchGames: jest.fn().mockResolvedValue(sample_search),
    platforms: jest.fn().mockResolvedValue(sample_platforms),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('games', () => {
    it('should call service.games with the platform query param', async () => {
      const platform = '167';
      const result = await controller.games(platform);

      expect(service.games).toHaveBeenCalledWith(platform);
      expect(result).toEqual(sample_games);
    });

    it('should call service.games with undefined if no platform is provided', async () => {
      const result = await controller.games(undefined);
      expect(service.games).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(sample_games);
    });
  });

  describe('search', () => {
    it('should return an empty array if no query is provided', async () => {
      const result = await controller.search('');

      expect(result).toEqual([]);
      expect(service.searchGames).not.toHaveBeenCalled();
    });

    it('should call service.searchGames when a query is provided', async () => {
      const query = 'Zelda';
      const result = await controller.search(query);

      expect(service.searchGames).toHaveBeenCalledWith(query);
      expect(result).toEqual(sample_search);
    });
  });

  describe('platforms', () => {
    it('should call service.platforms and return the result', async () => {
      const result = await controller.platforms();

      expect(service.platforms).toHaveBeenCalled();
      expect(result).toEqual(sample_platforms);
    });
  });
});
