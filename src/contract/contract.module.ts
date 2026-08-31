import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { Contract } from './entities/contract.entity';
import { Client } from '../client/entities/client.entity';
import { Project } from '../project/entities/project.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Client, Project, FreelancerProfile, ClientProfile])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
