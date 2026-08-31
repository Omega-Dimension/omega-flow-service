import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ILike, Repository } from 'typeorm';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { ClientQueryDto } from './dto/query.dto';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { User } from '../user/entities/user.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';

@Injectable()
export class ClientService {
  constructor(
    /**
     * Client repository
     */
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Use Case: Create Client
   * - check duplicate email
   * - create client under user
   */
  async create(user_id: string, createClientDto: CreateClientDto) {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: {
        user_id,
      },
    });

    if (!freelancerProfile) {
      throwNotFound('Freelancer profile not found');
    }

    if (
      createClientDto.email &&
      (await this.clientRepository.exists({
        where: {
          email: createClientDto.email,
          freelancer_profile_id: freelancerProfile.id,
        },
      }))
    ) {
      throwConflict('Email already exists');
    }

    // check if this email already belongs to a registered client account
    let client_profile_id: string | null = null;
    if (createClientDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: createClientDto.email },
      });

      if (existingUser) {
        const existingClientProfile =
          await this.clientProfileRepository.findOne({
            where: { user_id: existingUser.id },
          });

        if (existingClientProfile) {
          client_profile_id = existingClientProfile.id;
        }
      }
    }

    const client = this.clientRepository.create({
      freelancer_profile_id: freelancerProfile.id,
      client_profile_id: client_profile_id ?? undefined,
      ...createClientDto,
    });

    await this.clientRepository.save(client);

    return {
      success: true,
    };
  }

  /**
   * Use Case: Get Clients (Paginated)
   * - list clients
   * - filter by company/country
   * - return paginated result
   */
  async findAll(user_id: string, query: ClientQueryDto) {
    const { page_number, per_page, company_name, country } = query;

    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id: user_id },
    });

    if (!freelancerProfile) {
      throwNotFound('Freelancer profile not found');
    }

    const [data, total] = await this.clientRepository.findAndCount({
      where: {
        freelancer_profile_id: freelancerProfile.id,
        ...(company_name && { company: ILike(`%${company_name}%`) }),
        ...(country && { country }),
      },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }
  /**
   * Use Case: Get Single Client
   * - find client by id
   */
  async findOne(id: string) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) throwNotFound('Client not found');
    return client;
  }

  /**
   * Use Case: Update Client
   * - verify client exists
   * - update client data
   */
  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id);
    const { affected } = await this.clientRepository.update(
      id,
      updateClientDto,
    );

    if (!affected) throwConflict('Update failed');

    return { success: true };
  }

  /**
   * Use Case: Delete Client
   * - soft delete client
   */
  async remove(id: string) {
    const { affected } = await this.clientRepository.softDelete(id);
    if (!affected) throwConflict('Delete failed');
    return { success: true };
  }
}
