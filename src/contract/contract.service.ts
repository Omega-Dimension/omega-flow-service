import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { privateDecrypt } from 'crypto';
import { Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { Project } from '../project/entities/project.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { ContractQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
  ) {}

  /**
   * Use Case: Create Contract
   * - validate client
   * - validate project
   * - create contract under user
   */
  async create(user_id: string, createContractDto: CreateContractDto) {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id }, // adjust column name to your actual relation
    });
    if (!freelancerProfile) {
      throwNotFound('Freelancer profile not found for this user');
    }

    const [client, projectExists] = await Promise.all([
      this.clientRepository.findOne({
        where: { id: createContractDto.client_id },
      }),
      this.projectRepository.existsBy({ id: createContractDto.project_id }),
    ]);

    if (!client) throwNotFound('Client not found');
    if (!projectExists) throwNotFound('Project not found');
    if (!client.client_profile_id) {
      throwConflict(
        'This client has not registered an account yet. Contracts require a registered client to sign.',
      );
    }

    return {
      success: !!(await this.contractRepository.save(
        this.contractRepository.create({
          freelancer_profile_id: freelancerProfile.id,
          ...createContractDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Contracts (Paginated)
   * - list contracts
   * - filter by client/project/status
   * - include client and project relations
   */

  async findAll(user: JwtUser, query: ContractQueryDto) {
    const { page_number, per_page, client_id, project_id, status } = query;

    const [freelancerProfile, clientProfile] = await Promise.all([
      this.freelancerProfileRepository.findOne({ where: { user_id: user.id } }),
      this.clientProfileRepository.findOne({ where: { user_id: user.id } }),
    ]);

    const ownershipFilter: any[] = [];

    if (freelancerProfile) {
      ownershipFilter.push({
        freelancer_profile_id: freelancerProfile.id,
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      });
    }

    if (clientProfile) {
      ownershipFilter.push({
        client: { client_profile_id: clientProfile.id },
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      });
    }

    if (ownershipFilter.length === 0) {
      return paginationHandler([], 0, page_number, per_page);
    }

    const [data, total] = await this.contractRepository.findAndCount({
      where: ownershipFilter, // TypeORM treats an array of where-objects as OR
      relations: { client: true, project: true },
      ...paginationQueryHandler(query),
      order: { created_at: 'DESC' },
    });

    return paginationHandler(data, total, page_number, per_page);
  }
  /**
   * Use Case: Get Single Contract
   * - find contract with relations
   */
  async findOne(id: string, user?: JwtUser) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: { client: true, project: true, freelancer_profile: true },
    });

    if (!contract) throwNotFound('Contract not found');

    if (user) {
      const [freelancerProfile, clientProfile] = await Promise.all([
        this.freelancerProfileRepository.findOne({
          where: { user_id: user.id },
        }),
        this.clientProfileRepository.findOne({ where: { user_id: user.id } }),
      ]);

      const isFreelancer =
        freelancerProfile &&
        contract.freelancer_profile_id === freelancerProfile.id;
      const isClient =
        clientProfile &&
        contract.client?.client_profile_id === clientProfile.id;

      if (!isFreelancer && !isClient) {
        throwConflict('You are not authorized to view this contract');
      }
    }

    return contract;
  }

  /**
   * Use Case: Update Contract
   * - verify contract exists
   * - update contract data
   */
  async update(id: string, updateContractDto: UpdateContractDto) {
    await this.findOne(id);
    const { affected } = await this.contractRepository.update(
      id,
      updateContractDto,
    );

    if (!affected) throwConflict('Update failed');

    return {
      success: true,
    };
  }
  /**
   * Use Case: Delete Contract
   * - delete contract by id
   */
  async remove(id: string) {
    const { affected } = await this.contractRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }

  async sign(id: string, user: JwtUser, signature: string) {
    const contract = await this.findOne(id);

    // Step 1: login user (user.id) ကို profile id တွေနဲ့ ချိတ်ရှာပါ
    const [freelancerProfile, clientProfile] = await Promise.all([
      this.freelancerProfileRepository.findOne({ where: { user_id: user.id } }),
      this.clientProfileRepository.findOne({ where: { user_id: user.id } }),
    ]);

    // Step 2: contract ထဲက freelancer_id / client.client_profile_id နဲ့ တိုက်စစ်ပါ
    const isFreelancer =
      !!freelancerProfile &&
      contract.freelancer_profile_id === freelancerProfile.id;

    const isClient =
      !!clientProfile &&
      contract.client?.client_profile_id === clientProfile.id;

    if (!isFreelancer && !isClient) {
      throwConflict('You are not a party to this contract');
    }

    if (isFreelancer && contract.freelancer_signed) {
      throwConflict('You have already signed this contract');
    }
    if (isClient && contract.client_signed) {
      throwConflict('You have already signed this contract');
    }

    const patch = isFreelancer
      ? {
          freelancer_signed: true,
          freelancer_signed_at: new Date(),
          freelancer_signature: signature,
        }
      : {
          client_signed: true,
          client_signed_at: new Date(),
          client_signature: signature,
        };

    await this.contractRepository.update(id, patch);

    const updated = await this.findOne(id);
    if (
      updated.client_signed &&
      updated.freelancer_signed &&
      updated.status === 'draft'
    ) {
      await this.contractRepository.update(id, { status: 'active' });
    }

    return { success: true };
  }
}
