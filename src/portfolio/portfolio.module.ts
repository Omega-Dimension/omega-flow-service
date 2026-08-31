import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from './entities/portfolio.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, FreelancerProfile])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
