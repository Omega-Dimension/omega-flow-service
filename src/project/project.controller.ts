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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';

/**
 * Project Controller
 * ---------------------------------------------------
 * Handles all project related HTTP requests
 */

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Create project
   * POST /projects/:user_id
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: JwtUser, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(user.id, createProjectDto);
  }

  /**
   * Get all projects
   * GET /projects
   */
  @Get()
  findAll(@GetUser() user: JwtUser, @Query() query: ProjectQueryDto) {
    return this.projectService.findAll(user.id, query);
  }

  /**
   * Get single project
   * GET /projects/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  /**
   * Update project
   * PATCH /projects/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  /**
   * Delete project
   * DELETE /projects/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
