import { Injectable } from '@nestjs/common';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProfile } from './entities/client-profile.entity';
import { IsNull, Repository } from 'typeorm';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { ClientProfileQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { User } from '../user/entities/user.entity';
import { Client } from '../client/entities/client.entity';

@Injectable()
export class ClientProfileService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Use Case: Create Client Profile
   * - ensure the user doesn't already have a profile
   * - create profile for user
   */
  async create(
    user_id: string,
    createClientProfileDto: CreateClientProfileDto,
  ) {
    const existingProfile = await this.clientProfileRepository.findOne({
      where: { user_id },
    });
    if (existingProfile) {
      throwConflict('Client profile already exists');
    }

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) throwNotFound('User not found');

    const clientProfile = this.clientProfileRepository.create({
      user_id,
      ...createClientProfileDto,
    });
    await this.clientProfileRepository.save(clientProfile);

    await this.clientRepository.update(
      { email: user.email, client_profile_id: IsNull() },
      { client_profile_id: clientProfile.id },
    );

    return {
      success: true,
      data: clientProfile,
    };
  }

  /**
   * Use Case: Get Client Profiles (Paginated)
   * - list profiles
   * - filter by country
   */
  async findAll(query: ClientProfileQueryDto) {
    const { page_number, per_page, country } = query;
    const [data, total] = await this.clientProfileRepository.findAndCount({
      where: {
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
   * Use Case: Get Single Client Profile
   * - find profile with relations
   */
  async findOne(id: string) {
    const profile = await this.clientProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!profile) throwNotFound('Client profile not found');
    return profile;
  }

  /**
   * Use Case: Get Client Profile By User
   * - find profile by owning user
   */
  async findByUser(user_id: string) {
    const profile = await this.clientProfileRepository.findOne({
      where: { user_id },
    });
    if (!profile) throwNotFound('Client profile not found');
    return profile;
  }

  /**
   * Use Case: Update Client Profile
   * - verify profile exists
   * - update profile data
   */
  async update(id: string, updateClientProfileDto: UpdateClientProfileDto) {
    await this.findOne(id);
    const { affected } = await this.clientProfileRepository.update(
      id,
      updateClientProfileDto,
    );

    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Client Profile
   * - delete profile by id
   */
  async remove(id: string) {
    const { affected } = await this.clientProfileRepository.delete(id);
    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}
