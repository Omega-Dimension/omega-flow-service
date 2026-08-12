import { Module } from '@nestjs/common';
import { TimelogService } from './timelog.service';
import { TimelogController } from './timelog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timelog } from './entities/timelog.entity';
import { Project } from '../project/entities/project.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Timelog, Project, FreelancerProfile])
  ],
  controllers: [TimelogController],
  providers: [TimelogService],
  exports : [TimelogService]
})
export class TimelogModule {}
