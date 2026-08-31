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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto } from './dto/query.dto';
import { throwBadRequest } from '../libs/throwError';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Portfolio Controller
 * ---------------------------------------------------
 * Handles all portfolio related HTTP requests
 */

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  /**
   * Create portfolio item
   * POST /portfolios/:freelancer_profile_id
   */
  @Post(':freelancer_profile_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param(
      'freelancer_profile_id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          throwBadRequest('Freelancer profile ID must be a valid UUID'),
      }),
    )
    freelancer_profile_id: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.create(
      freelancer_profile_id,
      createPortfolioDto,
    );
  }

  /**
   * Get all portfolio items
   * GET /portfolios
   */
  @Get()
  findAll(@Query() query: PortfolioQueryDto) {
    return this.portfolioService.findAll(query);
  }

  /**
   * Get single portfolio item
   * GET /portfolios/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(id);
  }

  /**
   * Update portfolio item
   * PATCH /portfolios/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  /**
   * Delete portfolio item
   * DELETE /portfolios/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }
}
