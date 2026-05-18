import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { ProjectQueryDto } from './dto/query.dto';
import { paginationHandler, paginationQueryHandler } from '../libs/globalFunctions';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(user_id: string, createProjectDto: CreateProjectDto) {
    const client = await this.clientRepository.findOneBy({
      id: createProjectDto.client_id,
    });

    if (!client) throwNotFound('Client not found', { field: 'client_id' });

    return {
      success: !!(await this.projectRepository.save(
        this.projectRepository.create({
          user_id,
          ...createProjectDto,
        }),
      )),
    };
  }

  async findAll(query: ProjectQueryDto) {
    const { page_number, per_page, client_id, status } = query;

    const [data, total] = await this.projectRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(status && { status }),
      },

      relations: { client: true },

      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(
      data,
      total,
      page_number,
      per_page,
    );
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        client: true,
        user: true,
      },
    });

    if (!project) throwNotFound('Project not found', { field: id });

    return project;
  }

  /**
   * Update project
   */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);

    const { affected } = await this.projectRepository.update(
      id,
      updateProjectDto,
    );

    if (!affected)
      throwConflict('Update failed', {
        field: id,
      });

    return {
      success: true,
    };
  }

  /**
   * Delete project
   */
  async remove(id: string) {
    const { affected } = await this.projectRepository.delete(id);

    if (!affected)
      throwConflict('Delete failed', {
        field: id,
      });

    return {
      success: true,
    };
  }
}
