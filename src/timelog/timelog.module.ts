import { Module } from '@nestjs/common';
import { TimelogService } from './timelog.service';
import { TimelogController } from './timelog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timelog } from './entities/timelog.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Timelog])
  ],
  controllers: [TimelogController],
  providers: [TimelogService],
  exports : [TimelogService]
})
export class TimelogModule {}
