import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreelancerProfileService } from './freelancer-profile.service';
import { FreelancerProfileController } from './freelancer-profile.controller';
import { FreelancerProfile } from './entities/freelancer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FreelancerProfile])],
  controllers: [FreelancerProfileController],
  providers: [FreelancerProfileService],
  exports: [FreelancerProfileService],
})
export class FreelancerProfileModule {}