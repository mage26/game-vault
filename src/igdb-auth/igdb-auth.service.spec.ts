import { Test, TestingModule } from '@nestjs/testing';
import { IgdbAuthService } from './igdb-auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError, TimeoutError } from 'rxjs';
import {
  RequestTimeoutException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

describe('IgdbAuthService', () => {
  let service: IgdbAuthService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'clientId') return 'fake_client_id';
      if (key === 'clientSecret') return 'fake_client_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IgdbAuthService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<IgdbAuthService>(IgdbAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return a cached token if it exists', async () => {
      mockCacheManager.get.mockResolvedValue('cached_token');

      const token = await service.getAccessToken();

      expect(token).toBe('cached_token');
      expect(mockHttpService.post).not.toHaveBeenCalled();
    });

    it('should fetch a new token, cache it, and return it if no cache exists', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockResponse = {
        data: {
          access_token: 'new_token',
          expires_in: 3600,
          token_type: 'bearer',
        },
      };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      const token = await service.getAccessToken();

      expect(token).toBe('new_token');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'igdb_token',
        'new_token',
        3540000,
      );
    });

    it('should throw RequestTimeoutException on RxJS TimeoutError', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(
        throwError(() => new TimeoutError()),
      );

      await expect(service.getAccessToken()).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should pass through existing HttpExceptions', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const customError = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      mockHttpService.post.mockReturnValue(throwError(() => customError));

      await expect(service.getAccessToken()).rejects.toThrow(HttpException);
    });
  });

  describe('getAccessHeaders', () => {
    it('should return correctly formatted headers', async () => {
      mockCacheManager.get.mockResolvedValue('test_token');

      const headers = await service.getAccessHeaders();

      expect(headers).toEqual({
        'Client-ID': 'fake_client_id',
        Authorization: 'Bearer test_token',
        Accept: 'application/json',
      });
    });
  });
});
