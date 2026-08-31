import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { Client } from '../client/entities/client.entity';
import {
  CreateMeetingByClientDto,
  CreateMeetingByFreelancerDto,
} from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingQueryDto } from './dto/query.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';
import { MEETING_EVENTS, SocketService } from '../socket/socket.service';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,

    private readonly notificationService: NotificationService,
  ) {}

  async createByFreelancer(user_id: string, dto: CreateMeetingByFreelancerDto) {
    const freelancer = await this.freelancerProfileRepository.findOne({
      where: { user_id: user_id },
    });

    if (!freelancer) {
      throwNotFound('Freelancer profile not found');
    }

    const client = await this.clientRepository.findOne({
      where: {
        id: dto.client_id,
        freelancer_profile_id: freelancer.id,
      },
      relations: { client_profile: true },
    });

    if (!client) {
      throwNotFound('Client not found');
    }

    const meeting = this.meetingRepository.create({
      ...dto,
      freelancer_profile_id: freelancer.id,
      client_id: client.id,
      created_by: user_id,
    });

    const saved = await this.meetingRepository.save(meeting);

    // Create unread notification for the client
    if (client.client_profile?.user_id) {
      await this.notificationService.notifyUser(
        client.client_profile.user_id,
        MEETING_EVENTS.NEW,
        { meeting: saved, created_by_role: 'freelancer' },
      );
    }

    return {
      success: true,
      data: saved,
    };
  }

  async createByClient(user_id: string, dto: CreateMeetingByClientDto) {
    const clientProfile = await this.clientProfileRepository.findOne({
      where: {
        user_id,
      },
    });

    if (!clientProfile) {
      throwNotFound('Client profile not found');
    }

    const client = await this.clientRepository.findOne({
      where: {
        client_profile_id: clientProfile.id,
      },
    });

    if (!client) {
      throwNotFound('Client relationship not found');
    }

    // Make sure this client is actually
    // connected to the requested freelancer.
    const freelancer = await this.freelancerProfileRepository.findOne({
      where: {
        id: dto.freelancer_id,
      },
    });

    if (!freelancer) {
      throwNotFound('Freelancer not found');
    }

    const meeting = this.meetingRepository.create({
      ...dto,
      freelancer_profile_id: freelancer.id,
      client_id: client.id,
      created_by: user_id,
    });

    const saved = await this.meetingRepository.save(meeting);

    // Create unread notification for the freelancer

    if (freelancer.user_id) {
      await this.notificationService.notifyUser(
        freelancer.user_id,
        MEETING_EVENTS.NEW,
        { meeting: saved, created_by_role: 'client' },
      );
    }

    return {
      success: true,
      data: saved,
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

  // async findByFreelancer(user_id: string, query: MeetingQueryDto) {
  //   const {client_id, project_id, status, page_number, per_page} = query;
  //   const freelancer = await this.freelancerProfileRepository.findOne({
  //     where: { user_id },
  //   });
  //   if (!freelancer) {
  //     throwNotFound('Freelancer profile not found');
  //   }
  //   const [data, total] = await this.meetingRepository.findAndCount({
  //     where: {
  //       freelancer_profile_id: freelancer.id,
  //       ...(client_id && {client_id}),
  //       ...(project_id && {project_id}),
  //       ...(status && {status})
  //     },
  //     relations: {
  //       client: true,
  //       project: true,
  //     },
  //     ...paginationQueryHandler(query),

  //     order: {
  //       scheduled_at: 'ASC',
  //     },
  //   });
  //   return paginationHandler(data, total, page_number, per_page);
  // }

  async findByFreelancer(user_id: string, query: MeetingQueryDto) {
    try {
      const { client_id, project_id, status, page_number, per_page } = query;

      const freelancer = await this.freelancerProfileRepository.findOne({
        where: { user_id },
      });

      if (!freelancer) {
        throwNotFound('Freelancer profile not found');
      }

      const where = {
        freelancer_profile_id: freelancer.id,
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      };

      const pagination = paginationQueryHandler(query);

      const [data, total] = await this.meetingRepository.findAndCount({
        where,
        relations: {
          client: true,
          project: true,
        },
        ...pagination,
        order: {
          scheduled_at: 'ASC',
        },
      });

      return paginationHandler(data, total, page_number, per_page);
    } catch (error) {
      console.error('========== FIND FREELANCER MEETINGS ERROR ==========');
      console.error(error);
      console.error('====================================================');

      throw error;
    }
  }

  async findByClient(user_id: string, query: MeetingQueryDto) {
    const clientProfile = await this.clientProfileRepository.findOne({
      where: {
        user_id,
      },
    });

    if (!clientProfile) {
      throwNotFound('Client profile not found');
    }

    const [data, total] = await this.meetingRepository.findAndCount({
      where: {
        client: {
          client_profile_id: clientProfile.id,
        },

        ...(query.project_id && {
          project_id: query.project_id,
        }),

        ...(query.status && {
          status: query.status,
        }),
      },

      relations: {
        client: true,
        project: true,
        freelancer_profile: true,
      },

      ...paginationQueryHandler(query),

      order: {
        scheduled_at: 'ASC',
      },
    });

    return paginationHandler(data, total, query.page_number, query.per_page);
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
   * - real-time: notify the other party about changes
   */
  async update(
    id: string,
    updateMeetingDto: UpdateMeetingDto,
    actor_user_id?: string,
  ) {
    const existing = await this.meetingRepository.findOne({
      where: { id },
      relations: {
        freelancer_profile: true,
        client: { client_profile: true },
      },
    });
    if (!existing) throwNotFound('Meeting not found');

    const { affected } = await this.meetingRepository.update(
      id,
      updateMeetingDto,
    );
    if (!affected) throwConflict('Update failed');

    const updated = await this.findOne(id);
    const payload = { meeting: updated };

    // Create/unupdate notification for the other party
    const freelancer_user_id = existing.freelancer_profile?.user_id;
    const client_user_id = existing.client?.client_profile?.user_id;

    if (freelancer_user_id && freelancer_user_id !== actor_user_id) {
      await this.notificationService.notifyUser(
        freelancer_user_id,
        MEETING_EVENTS.UPDATE,
        payload,
      );
    }
    if (client_user_id && client_user_id !== actor_user_id) {
      await this.notificationService.notifyUser(
        client_user_id,
        MEETING_EVENTS.UPDATE,
        payload,
      );
    }

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
