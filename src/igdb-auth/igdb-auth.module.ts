import { Module } from '@nestjs/common';
import { IgdbAuthService } from './igdb-auth.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule.register({ timeout: 5000 }), CacheModule.register()],
  providers: [IgdbAuthService],
  exports: [IgdbAuthService],
})
export class IgdbAuthModule {}
