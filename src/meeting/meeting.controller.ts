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
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingQueryDto } from './dto/query.dto';

/**
 * Meeting Controller
 * ---------------------------------------------------
 * Handles all meeting related HTTP requests
 */

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  /**
   * Create meeting
   * POST /meetings/:user_id
   */
  @Post(':user_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('user_id') user_id: string,
    @Body() createMeetingDto: CreateMeetingDto,
  ) {
    return this.meetingService.create(user_id, createMeetingDto);
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