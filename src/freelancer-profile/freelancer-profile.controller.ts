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
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FreelancerProfileService } from './freelancer-profile.service';
import { CreateFreelancerProfileDto } from './dto/create-freelancer-profile.dto';
import { UpdateFreelancerProfileDto } from './dto/update-freelancer-profile.dto';
import { FreelancerProfileQueryDto } from './dto/query.dto';
import { throwBadRequest } from '../libs/throwError';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';

/**
 * Freelancer Profile Controller
 * ---------------------------------------------------
 * Handles all freelancer profile related HTTP requests
 */

@Controller('freelancer-profiles')
@UseGuards(JwtAuthGuard)
export class FreelancerProfileController {
  constructor(
    private readonly freelancerProfileService: FreelancerProfileService,
  ) {}

  /**
   * Create freelancer profile
   * POST /freelancer-profiles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser() user: JwtUser,
    @Body() createFreelancerProfileDto: CreateFreelancerProfileDto,
  ) {
    return this.freelancerProfileService.create(
      user.id,
      createFreelancerProfileDto,
    );
  }

  /**
   * Get all freelancer profiles
   * GET /freelancer-profiles
   */
  @Get()
  findAll(@Query() query: FreelancerProfileQueryDto) {
    return this.freelancerProfileService.findAll(query);
  }

  /**
   * Get freelancer profile by user
   * GET /freelancer-profiles/user/:user_id
   */
  @Get('user/:user_id')
  findByUser(
    @Param(
      'user_id',
      new ParseUUIDPipe({
        exceptionFactory: () => throwBadRequest('User ID must be a valid UUID'),
      }),
    )
    user_id: string,
  ) {
    return this.freelancerProfileService.findByUser(user_id);
  }

  /**
   * Get single freelancer profile
   * GET /freelancer-profiles/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.freelancerProfileService.findOne(id);
  }

  /**
   * Update freelancer profile
   * PATCH /freelancer-profiles/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFreelancerProfileDto: UpdateFreelancerProfileDto,
  ) {
    return this.freelancerProfileService.update(id, updateFreelancerProfileDto);
  }

  /**
   * Delete freelancer profile
   * DELETE /freelancer-profiles/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.freelancerProfileService.remove(id);
  }
}
