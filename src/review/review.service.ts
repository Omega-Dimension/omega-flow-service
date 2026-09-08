import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';
import { ReviewerType } from '../libs/constants';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
  ) {}

  /**
   * Use Case: Create Review
   * - resolve project -> client
   * - derive reviewer_type from caller's actual role on the project (never trust client input)
   * - block duplicate review for same project/direction
   */
  async create(user_id: string, createReviewDto: CreateReviewDto) {
    const { project_id, rating, title, comment } = createReviewDto;

    const project = await this.projectRepository.findOne({
      where: { id: project_id },
    });
    if (!project) throwNotFound('Project not found');

    const client = await this.clientRepository.findOne({
      where: { id: project.client_id },
    });
    if (!client) throwNotFound('Client not found');

    const [freelancerProfile, clientProfile] = await Promise.all([
      this.freelancerProfileRepository.findOne({ where: { user_id } }),
      this.clientProfileRepository.findOne({ where: { user_id } }),
    ]);

    let reviewer_type: ReviewerType;

    if (
      freelancerProfile &&
      project.freelancer_profile_id === freelancerProfile.id
    ) {
      reviewer_type = ReviewerType.FREELANCER;
    } else if (
      clientProfile &&
      client.client_profile_id === clientProfile.id
    ) {
      reviewer_type = ReviewerType.CLIENT;
    } else {
      throw new ForbiddenException(
        'You are not a participant on this project',
      );
    }

    const existingReview = await this.reviewRepository.findOne({
      where: {
        freelancer_profile_id: project.freelancer_profile_id,
        client_id: project.client_id,
        project_id,
        reviewer_type,
      },
    });
    if (existingReview) {
      throwConflict('You have already reviewed this project');
    }

    const review = this.reviewRepository.create({
      freelancer_profile_id: project.freelancer_profile_id,
      client_id: project.client_id,
      project_id,
      reviewer_type,
      rating,
      title,
      comment,
    });

    return this.reviewRepository.save(review);
  }

  /**
   * Use Case: Get Reviews (Paginated)
   * - filter by client / project / freelancer_profile / reviewer_type
   * - client_profile_id filters through the client relation, no query builder needed
   */
  async findAll(query: ReviewQueryDto) {
    const {
      page_number,
      per_page,
      client_id,
      project_id,
      freelancer_profile_id,
      client_profile_id,
      reviewer_type,
    } = query;

    const [data, total] = await this.reviewRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(freelancer_profile_id && { freelancer_profile_id }),
        ...(reviewer_type && { reviewer_type }),
        ...(client_profile_id && { client: { client_profile_id } }),
      },
      relations: { client: true, project: true, freelancer_profile : {user : true} },
      ...paginationQueryHandler(query),
      order: { created_at: 'DESC' },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Review
   */
  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { client: true, project: true, freelancer_profile : {user : true} },
    });
    if (!review) throwNotFound('Review not found');
    return review;
  }

  /**
   * Only the original reviewer may update/delete their own review.
   */
  private async assertOwnership(review: Review, user_id: string) {
    if (review.reviewer_type === ReviewerType.FREELANCER) {
      const freelancerProfile = await this.freelancerProfileRepository.findOne(
        { where: { user_id } },
      );
      if (
        !freelancerProfile ||
        freelancerProfile.id !== review.freelancer_profile_id
      ) {
        throw new ForbiddenException('You can only modify your own review');
      }
    } else {
      const [client, clientProfile] = await Promise.all([
        this.clientRepository.findOne({ where: { id: review.client_id } }),
        this.clientProfileRepository.findOne({ where: { user_id } }),
      ]);
      if (
        !client ||
        !clientProfile ||
        client.client_profile_id !== clientProfile.id
      ) {
        throw new ForbiddenException('You can only modify your own review');
      }
    }
  }

  /**
   * Use Case: Update Review
   */
  async update(id: string, user_id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);
    await this.assertOwnership(review, user_id);

    const { affected } = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );
    if (!affected) throwConflict('Update failed');

    return this.findOne(id);
  }

  /**
   * Use Case: Delete Review
   */
  async remove(id: string, user_id: string) {
    const review = await this.findOne(id);
    await this.assertOwnership(review, user_id);

    const { affected } = await this.reviewRepository.delete(id);
    if (!affected) throwConflict('Delete failed');

    return { success: true };
  }
}