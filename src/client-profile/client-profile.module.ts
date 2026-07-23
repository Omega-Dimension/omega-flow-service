import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProfileService } from './client-profile.service';
import { ClientProfileController } from './client-profile.controller';
import { ClientProfile } from './entities/client-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientProfile])],
  controllers: [ClientProfileController],
  providers: [ClientProfileService],
  exports: [ClientProfileService],
})
export class ClientProfileModule {}