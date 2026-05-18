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

  async create(user_id: string, createClientDto: CreateClientDto) {
    if (
      createClientDto.email &&
      (await this.clientRepository.exists({
        where: {
          email: createClientDto.email,
        },
      }))
    ) {
      throwConflict('Email already exists', {
        field: 'email',
      });
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
   * Get Client List (Paginated + Filtered)
   * ---------------------------------------------------
   * Use case:
   * - Retrieves a paginated list of clients
   * - Supports optional filtering by company and country
   * - Uses SQL LIKE search for company (case-insensitive)
   * - Uses exact match for country
   *
   * Flow:
   * 1. Extract pagination + filters from query
   * 2. Build dynamic WHERE conditions
   * 3. Apply pagination (take/skip)
   * 4. Sort by newest clients first
   * 5. Return standardized pagination response
   *
   * Example query:
   * ?page_number=1&per_page=10&company=John&country=SG
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
   * Get single client
   */

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({ where : {id} });
    if (!client) throwNotFound('Client not found', { field: id });
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id);
    const { affected } = await this.clientRepository.update(
      id,
      updateClientDto,
    );

    if (!affected) throwConflict('Update failed', { field: id });

    return { success: true };
  }

  async remove(id: string) {
    const { affected } = await this.clientRepository.softDelete(id);
    if (!affected) throwConflict('Delete failed', { field: id });
    return { success: true };
  }
}
