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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/query.dto';

/**
 * Project Controller
 * ---------------------------------------------------
 * Handles all project related HTTP requests
 */

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Create project
   * POST /projects/:user_id
   */
  @Post(':user_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('user_id') user_id: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(user_id, createProjectDto);
  }

  /**
   * Get all projects
   * GET /projects
   */
  @Get()
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectService.findAll(query);
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
