import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import {
  CreateMeetingByClientDto,
  CreateMeetingByFreelancerDto,
  CreateMeetingDto,
} from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingQueryDto } from './dto/query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Meeting Controller
 * ---------------------------------------------------
 * Handles all meeting related HTTP requests
 */

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('freelancer')
  @HttpCode(HttpStatus.CREATED)
  createByFreelancer(
    @GetUser() user: JwtUser,
    @Body() dto: CreateMeetingByFreelancerDto,
  ) {
    return this.meetingService.createByFreelancer(user.id, dto);
  }

  @Post('client')
  @HttpCode(HttpStatus.CREATED)
  createByClient(
    @GetUser() user: JwtUser,
    @Body() dto: CreateMeetingByClientDto,
  ) {
    return this.meetingService.createByClient(user.id, dto);
  }

  /**
   * Get meetings for current freelancer
   * GET /meetings/freelancer
   */
  @Get('freelancer')
  findByFreelancer(@GetUser() user: JwtUser, @Query() query: MeetingQueryDto) {
    return this.meetingService.findByFreelancer(user.id, query);
  }

  /**
   * Get meetings for current client
   * GET /meetings/client
   */
  @Get('client')
  findByClient(@GetUser() user: JwtUser, @Query() query: MeetingQueryDto) {
    return this.meetingService.findByClient(user.id, query);
  }

  /**
   * Get all meetings
   * GET /meetings
   */
  @Get()
  findAll(@Query() query: MeetingQueryDto) {
    return this.meetingService.findAll(query);
  }

  /**
   * Get single meeting
   * GET /meetings/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingService.findOne(id);
  }

  /**
   * Update meeting
   * PATCH /meetings/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingService.update(id, updateMeetingDto);
  }

  /**
   * Delete meeting
   * DELETE /meetings/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingService.remove(id);
  }
}
