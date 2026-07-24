import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class TimelogService {
  constructor(
    @InjectRepository(Timelog)
    private readonly timelogRepository: Repository<Timelog>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Use Case: Create Time Log
   * - validate project
   * - create time log under user
   */
  async create(user_id: string, createTimelogDto: CreateTimelogDto) {
    if(!(await this.projectRepository.existsBy({id : createTimelogDto.project_id}))) throwNotFound("Project not found");
    return {
      success: !!(await this.timelogRepository.save(
        this.timelogRepository.create({
          user_id,
          ...createTimelogDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Time Logs (Paginated)
   * - list time logs
   * - filter by project/billable
   * - include project relation
   */
  async findAll(query: TimelogQueryDto) {
    const { page_number, per_page, project_id, is_billable } = query;

    const [data, total] = await this.timelogRepository.findAndCount({
      where: {
        ...(project_id && { project_id }),
        ...(is_billable !== undefined && {
          is_billable: is_billable === 'true',
        }),
      },
      relations: { project: true },
      ...paginationQueryHandler(query),
      order: {
        log_date: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Time Log
   * - find time log with relations
   */
  async findOne(id: string) {
    const timelog = await this.timelogRepository.findOne({
      where: { id },
      relations: { project: true, user: true },
    });
    if (!timelog) throwNotFound('Time log not found');
    return timelog;
  }

  /**
   * Use Case: Update Time Log
   * - verify time log exists
   * - update time log data
   */
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

  /**
   * Use Case: Delete Time Log
   * - delete time log by id
   */
  async remove(id: string) {
    const { affected } = await this.timelogRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}