import { Injectable } from '@nestjs/common';
import { CreateTimelogDto } from './dto/create-timelog.dto';
import { UpdateTimelogDto } from './dto/update-timelog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Timelog } from './entities/timelog.entity';
import { Repository } from 'typeorm';
import { TimelogQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class TimelogService {
  constructor(
    // Timelog database repository

    @InjectRepository(Timelog)
    private readonly timelogRepository: Repository<Timelog>,
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Use Case: Create Timelog
   */
  async create(createTimelogDto: CreateTimelogDto) {
    if (
      !(await this.projectRepository.exists({
        where: { id: createTimelogDto.project_id },
      }))
    )
      throwNotFound('Project not found');

    return {
      success: !!(await this.timelogRepository.save(
        this.timelogRepository.create(createTimelogDto),
      )),
    };
  }
  /**
   * Use Case: Get Users (Paginated)
   * - list users
   * - filter by email/company
   * - return paginated result
   */
  async findAll(query: TimelogQueryDto) {
    const { page_number, per_page, project_id, user_id } = query;
    const [data, total] = await this.timelogRepository.findAndCount({
      where: {
        ...(project_id && { project_id }),
        ...(user_id && { user_id }),
      },
      relations: {
        project: true,
        user: true,
      },
      ...paginationQueryHandler(query),
      order: {
        log_date: 'DESC',
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Timelog
   * - find timelog by id
   */

  async findOne(id: string) {
    const timelog = await this.timelogRepository.findOne({
      where: { id },
      relations: { project: true, user: true },
    });
    if (!timelog) throwNotFound('Timelog not found');

    return timelog;
  }

  /**
   * Use Case: Update Timelog
   * - verify timelog exists
   * - update timelog data
   */
  async update(id: string, updateTimelogDto: UpdateTimelogDto) {
    await this.findOne(id);

    const { affected } = await this.timelogRepository.update(
      id,
      updateTimelogDto,
    );

    if (!affected) throwConflict('Update failed');

    return { success: true };
  }

  /**
   * Use Case: Delete Timelog
   * - delete timelog by id
   */
  async remove(id: string) {
    const { affected } = await this.timelogRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return { success: true };
  }
}
