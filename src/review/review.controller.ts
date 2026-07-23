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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/query.dto';

/**
 * Review Controller
 * ---------------------------------------------------
 * Handles all review related HTTP requests
 */

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Create review
   * POST /reviews/:user_id
   */
  @Post(':user_id')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('user_id') user_id: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(user_id, createReviewDto);
  }

  /**
   * Get all reviews
   * GET /reviews
   */
  @Get()
  findAll(@Query() query: ReviewQueryDto) {
    return this.reviewService.findAll(query);
  }

  /**
   * Get single review
   * GET /reviews/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  /**
   * Update review
   * PATCH /reviews/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  /**
   * Delete review
   * DELETE /reviews/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}