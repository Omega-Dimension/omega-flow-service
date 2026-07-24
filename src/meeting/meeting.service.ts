import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { Client } from '../client/entities/client.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingQueryDto } from './dto/query.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * Use Case: Create Meeting
   * - validate client
   * - create meeting under user
   */
  async create(user_id: string, createMeetingDto: CreateMeetingDto) {
    if(!(await this.clientRepository.existsBy({id : createMeetingDto.client_id}))) throwNotFound("Client not found")
    return {
      success: !!(await this.meetingRepository.save(
        this.meetingRepository.create({
          user_id,
          created_by: user_id,
          ...createMeetingDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Meetings (Paginated)
   * - list meetings
   * - filter by client/project/status
   * - include client relation
   */
  async findAll(query: MeetingQueryDto) {
    const { page_number, per_page, client_id, project_id, status } = query;

    const [data, total] = await this.meetingRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      },
      relations: { client: true },
      ...paginationQueryHandler(query),
      order: {
        scheduled_at: 'ASC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Meeting
   * - find meeting with relations
   */
  async findOne(id: string) {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: { client: true, project: true },
    });
    if (!meeting) throwNotFound('Meeting not found');
    return meeting;
  }

  /**
   * Use Case: Update Meeting
   * - verify meeting exists
   * - update meeting data
   */
  async update(id: string, updateMeetingDto: UpdateMeetingDto) {
    await this.findOne(id);
    const { affected } = await this.meetingRepository.update(
      id,
      updateMeetingDto,
    );
    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Meeting
   * - delete meeting by id
   */
  async remove(id: string) {
    const { affected } = await this.meetingRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}