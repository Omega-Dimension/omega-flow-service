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


@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Use Case: Create Contract
   * - validate client
   * - validate project
   * - create contract under user
   */
  async create(freelancer_profile_id: string, createContractDto: CreateContractDto) {
    const [clientExists, projectExists] = await Promise.all([
      this.clientRepository.existsBy({id : createContractDto.client_id}),
      this.projectRepository.existsBy({id : createContractDto.project_id})
    ])

    if (!clientExists) throwNotFound('Client not found');
    if (!projectExists) throwNotFound('Project not found');

    return {
      success: !!(await this.contractRepository.save(
        this.contractRepository.create({
          freelancer_profile_id,
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

  async findAll(query: ContractQueryDto) {
    const { page_number, per_page, client_id, project_id, status } = query;

    const [data, total] = await this.contractRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      },
      relations: { client: true, project: true },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }
  /**
   * Use Case: Get Single Contract
   * - find contract with relations
   */
  async findOne(id: string) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: { client: true, project: true, freelancer_profile: true },
    });

    if (!contract) throwNotFound('Contract not found');
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
}
