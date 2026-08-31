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
import { TimelogService } from './timelog.service';
import { CreateTimelogDto } from './dto/create-timelog.dto';
import { UpdateTimelogDto } from './dto/update-timelog.dto';
import { TimelogQueryDto } from './dto/query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Timelog Controller
 * ---------------------------------------------------
 * Handles all time log related HTTP requests
 */

@Controller('time-logs')
@UseGuards(JwtAuthGuard)
export class TimelogController {
  constructor(private readonly timelogService: TimelogService) {}

  /**
   * Create time log
   * POST /time-logs/:user_id
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: JwtUser, @Body() createTimelogDto: CreateTimelogDto) {
    return this.timelogService.create(user.id, createTimelogDto);
  }

  /**
   * Get all time logs
   * GET /time-logs
   */
  @Get()
  findAll(@GetUser() user: JwtUser, @Query() query: TimelogQueryDto) {
    return this.timelogService.findAll(user.id, query);
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
