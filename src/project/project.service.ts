import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { ProjectQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
  ) {}

  /**
   * Use Case: Create Project
   * - validate client
   * - create project under user
   */
  async create(user_id: string, createProjectDto: CreateProjectDto) {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });
    if (!freelancerProfile) {
      throwNotFound('Freelancer profile not found');
    }
    if (
      !(await this.clientRepository.findOne({
        where: {
          id: createProjectDto.client_id,
          freelancer_profile_id: freelancerProfile.id,
        },
      }))
    )
      throwNotFound('Client not found');
    return {
      success: !!(await this.projectRepository.save(
        this.projectRepository.create({
          freelancer_profile_id: freelancerProfile.id,
          ...createProjectDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Projects (Paginated)
   * - list projects
   * - filter by client/status
   * - include client relation
   */
  async findAll(user_id: string, query: ProjectQueryDto) {
    const { page_number, per_page, client_id, status } = query;

    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: {
        user_id,
      },
    });
    if (!freelancerProfile) throwNotFound('Freelancer profile not found');

    const [data, total] = await this.projectRepository.findAndCount({
      where: {
        freelancer_profile_id: freelancerProfile.id,
        ...(client_id && { client_id }),
        ...(status && { status }),
      },
      relations: { client: true },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Project
   * - find project with relations
   */
  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        client: true,
        freelancer_profile: true,
      },
    });
    if (!project) throwNotFound('Project not found');
    return project;
  }

  /**
   * Use Case: Update Project
   * - verify project exists
   * - update project data
   */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);
    const { affected } = await this.projectRepository.update(
      id,
      updateProjectDto,
    );
    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Project
   * - delete project by id
   */
  async remove(id: string) {
    const { affected } = await this.projectRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}
