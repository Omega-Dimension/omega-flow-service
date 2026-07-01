import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ILike, Repository } from 'typeorm';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { ClientQueryDto } from './dto/query.dto';

@Injectable()
export class ClientService {
  constructor(
    /**
     * Client repository
     */
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Use Case: Create Client
   * - check duplicate email
   * - create client under user
   */
  async create(user_id: string, createClientDto: CreateClientDto) {
    if (
      createClientDto.email &&
      (await this.clientRepository.exists({
        where: {
          email: createClientDto.email,
        },
      }))
    ) {
      throwConflict('Email already exists');
    }

    return {
      success: !!(await this.clientRepository.save(
        this.clientRepository.create({
          user_id,
          ...createClientDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Clients (Paginated)
   * - list clients
   * - filter by company/country
   * - return paginated result
   */
  async findAll(query: ClientQueryDto) {
    const { page_number, per_page, company, country } = query;

    const [data, total] = await this.clientRepository.findAndCount({
      where: {
        ...(company && { company: ILike(`%${company}%`) }),
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
