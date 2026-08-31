import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FreelancerProfile } from './entities/freelancer-profile.entity';
import { ILike, Repository } from 'typeorm';
import { CreateFreelancerProfileDto } from './dto/create-freelancer-profile.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { FreelancerProfileQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { UpdateFreelancerProfileDto } from './dto/update-freelancer-profile.dto';

@Injectable()
export class FreelancerProfileService {
  constructor(
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
  ) {}

  /**
   * Use Case: Create Freelancer Profile
   * - ensure the user doesn't already have a profile
   * - create profile for user
   */
  async create(
    user_id: string,
    createFreelancerProfileDto: CreateFreelancerProfileDto,
  ) {
    if (await this.freelancerProfileRepository.existsBy({ user_id }))
      throwConflict('Freelancer profile already exists');
    const profile = await this.freelancerProfileRepository.save(
      this.freelancerProfileRepository.create({
        user_id,
        ...createFreelancerProfileDto,
      }),
    );
    return {
      success: true,
      data: profile,
    };
  }

  /**
   * Use Case: Get Freelancer Profiles (Paginated)
   * - list profiles
   * - filter by visibility / country
   * - include owning user (name, email) so clients can browse
   */
  async findAll(query: FreelancerProfileQueryDto) {
    const { page_number, per_page, is_public, country } = query;

    const [data, total] = await this.freelancerProfileRepository.findAndCount({
      where: {
        ...(is_public !== undefined && { is_public: is_public === 'true' }),
        ...(country && { country: ILike(`%${country}%`) }),
      },
      relations: { user: true },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Freelancer Profile
   * - find profile with relations
   */
  async findOne(id: string) {
    const profile = await this.freelancerProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!profile) throwNotFound('Freelancer profile not found');
    return profile;
  }

  /**
   * Use Case: Get Freelancer Profile By User
   * - find profile by owning user
   */
  async findByUser(user_id: string) {
    const profile = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });

    if (!profile) throwNotFound('Freelancer profile not found');
    return profile;
  }

  /**
   * Use Case: Update Freelancer Profile
   * - verify profile exists
   * - update profile data
   */
  async update(
    id: string,
    updateFreelancerProfileDto: UpdateFreelancerProfileDto,
  ) {
    await this.findOne(id);
    const { affected } = await this.freelancerProfileRepository.update(
      id,
      updateFreelancerProfileDto,
    );

    if (!affected) throwConflict('Update failed');

    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Freelancer Profile
   * - delete profile by id
   */
  async remove(id: string) {
    const { affected } = await this.freelancerProfileRepository.delete(id);
    if (!affected) throwConflict('Delete failed');
    return {
      success: true,
    };
  }
}
