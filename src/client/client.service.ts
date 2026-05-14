import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { paginationHandler, queryHandler } from '../libs/globalFunctions';

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
   * Get all clients
   */

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.clientRepository.findAndCount({
      ...queryHandler(query),
      relations: { user: true },
      order: { created_at: 'DESC' },
    });

    return paginationHandler(data, total, query.page_number, query.per_page);
  }

  /**
   * Get single client
   */

  async findOne(id: string) {
    const client = await this.clientRepository.findOneBy({ id });
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
