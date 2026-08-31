import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { User } from '../user/entities/user.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, FreelancerProfile, ClientProfile, User]),
  ],

  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
