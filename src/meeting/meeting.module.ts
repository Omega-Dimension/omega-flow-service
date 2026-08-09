import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { Meeting } from './entities/meeting.entity';
import { Client } from '../client/entities/client.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      Client,
      FreelancerProfile,
      ClientProfile,
    ]),
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}
