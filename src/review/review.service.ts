import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Client } from '../client/entities/client.entity';
import { Project } from '../project/entities/project.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/query.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Use Case: Create Review
   * - validate client
   * - validate project
   * - create review under user
   */
  async create(user_id: string, createReviewDto: CreateReviewDto) {
    const clientExists = await this.clientRepository.existsBy({
      id: createReviewDto.client_id,
    });
    if (!clientExists) throwNotFound('Client not found');

    const projectExists = await this.projectRepository.existsBy({
      id: createReviewDto.project_id,
    });
    if (!projectExists) throwNotFound('Project not found');

    return {
      success: !!(await this.reviewRepository.save(
        this.reviewRepository.create({
          user_id,
          ...createReviewDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Reviews (Paginated)
   * - list reviews
   * - filter by client/project
   * - include client relation
   */
  async findAll(query: ReviewQueryDto) {
    const { page_number, per_page, client_id, project_id } = query;

    const [data, total] = await this.reviewRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
      },
      relations: { client: true },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Review
   * - find review with relations
   */
  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { client: true, project: true },
    });
    if (!review) throwNotFound('Review not found');
    return review;
  }

  /**
   * Use Case: Update Review
   * - verify review exists
   * - update review data
   */
  async update(id: string, updateReviewDto: UpdateReviewDto) {
    await this.findOne(id);
    const { affected } = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );
    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Review
   * - delete review by id
   */
  async remove(id: string) {
    const { affected } = await this.reviewRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}