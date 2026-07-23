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
import { TimelogService } from './timelog.service';
import { CreateTimelogDto } from './dto/create-timelog.dto';
import { UpdateTimelogDto } from './dto/update-timelog.dto';
import { TimelogQueryDto } from './dto/query.dto';

/**
 * Timelog Controller
 * ---------------------------------------------------
 * Handles all time log related HTTP requests
 */

@Controller('time-logs')
export class TimelogController {
  constructor(private readonly timelogService: TimelogService) {}

  /**
   * Create time log
   * POST /time-logs/:user_id
   */
  @Post(':user_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('user_id') user_id: string,
    @Body() createTimelogDto: CreateTimelogDto,
  ) {
    return this.timelogService.create(user_id, createTimelogDto);
  }

  /**
   * Get all time logs
   * GET /time-logs
   */
  @Get()
  findAll(@Query() query: TimelogQueryDto) {
    return this.timelogService.findAll(query);
  }

  /**
   * Get single time log
   * GET /time-logs/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timelogService.findOne(id);
  }

  /**
   * Update time log
   * PATCH /time-logs/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimelogDto: UpdateTimelogDto) {
    return this.timelogService.update(id, updateTimelogDto);
  }

  /**
   * Delete time log
   * DELETE /time-logs/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timelogService.remove(id);
  }
}