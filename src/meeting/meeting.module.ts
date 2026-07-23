import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { Meeting } from './entities/meeting.entity';
import { Client } from '../client/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Client])],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}