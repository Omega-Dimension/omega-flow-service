import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TimelogService } from './timelog.service';
import { CreateTimelogDto } from './dto/create-timelog.dto';
import { UpdateTimelogDto } from './dto/update-timelog.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * Time Logs Controller
 * ---------------------------------------------------
 * Handles HTTP requests for timelogs-related operations.
 * Architecture:
 * Client → Controller → Service → Repository
 */

@Controller('timelogs')
export class TimelogController {
  constructor(
      /**
     * Business logic layer (TimeLogService)
     */
    private readonly timelogService: TimelogService
  
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTimelogDto: CreateTimelogDto) {
    return this.timelogService.create(createTimelogDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.timelogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timelogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimelogDto: UpdateTimelogDto) {
    return this.timelogService.update(id, updateTimelogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timelogService.remove(id);
  }
}
