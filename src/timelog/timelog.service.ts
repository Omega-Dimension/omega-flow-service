import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Timelog } from './entities/timelog.entity';
import { Project } from '../project/entities/project.entity';
import { CreateTimelogDto } from './dto/create-timelog.dto';
import { UpdateTimelogDto } from './dto/update-timelog.dto';
import { TimelogQueryDto } from './dto/query.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';
import { Client } from '../client/entities/client.entity';

@Injectable()
export class TimelogService {
  constructor(
    @InjectRepository(Timelog)
    private readonly timelogRepository: Repository<Timelog>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository:   Repository<ClientProfile>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Use Case: Create Time Log
   * - validate project
   * - create time log under user
   */
  async create(user_id: string, createTimelogDto: CreateTimelogDto) {
    const freelancer = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });

    if (!freelancer) throwNotFound('Freelancer profile not found');

    if (
      !(await this.projectRepository.findOne({
        where: {
          id: createTimelogDto.project_id,
          freelancer_profile_id: freelancer.id,
        },
      }))
    )
      throwNotFound('Project not found');
    return {
      success: !!(await this.timelogRepository.save(
        this.timelogRepository.create({
          freelancer_profile_id: freelancer.id,
          ...createTimelogDto,
        }),
      )),
    };
  }

  async findAll(user_id: string, query: TimelogQueryDto) {
    const { page_number, per_page, project_id, is_billable } = query;
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: {
        user_id,
      },
      select: {
        id: true,
      },
    });

    let projectIds: string[] | undefined;
    let scopedWhere: any = {};

    if (freelancerProfile) {
      scopedWhere.freelancer_profile_id = freelancerProfile.id;
    } else {
      const clientProfile = await this.clientProfileRepository.findOne({
        where: { user_id },
        select: { id: true },
      });
      if (!clientProfile)
        throwNotFound('Freelancer or client profile not found');

      const clients = await this.clientRepository.find({
        where: { client_profile_id: clientProfile.id },
        select: { id: true },
      });

      if (!clients.length)
        return paginationHandler([], 0, page_number, per_page);

      const clientIds = clients.map((c) => c.id);

      const projects = await this.projectRepository.find({
        where: { client_id: In(clientIds) },
        select: { id: true },
      });

      projectIds = projects.map((p) => p.id);

      if (!projectIds.length)
        return paginationHandler([], 0, page_number, per_page);
      scopedWhere.project_id = In(projectIds);
    }

    const [data, total] = await this.timelogRepository.findAndCount({
      where: {
        ...scopedWhere,
        ...(project_id && { project_id }),
        ...(is_billable !== undefined && {
          is_billable: is_billable === 'true',
        }),
      },
      relations: { project: true },
      ...paginationQueryHandler(query),
      order: { log_date: 'DESC' },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  async findOne(id: string) {
    const timelog = await this.timelogRepository.findOne({
      where: { id },
      relations: { project: true, freelancer_profile: true },
    });
    if (!timelog) throwNotFound('Time log not found');
    return timelog;
  }

  async update(id: string, updateTimelogDto: UpdateTimelogDto) {
    await this.findOne(id);
    const { affected } = await this.timelogRepository.update(
      id,
      updateTimelogDto,
    );
    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  async remove(id: string) {
    const { affected } = await this.timelogRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}
