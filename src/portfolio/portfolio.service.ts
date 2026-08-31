import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto } from './dto/query.dto';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerRepository: Repository<FreelancerProfile>,
  ) {}

  /**
   * Use Case: Create Portfolio Item
   * - create portfolio entry under user
   */
  async create(
    freelancer_profile_id: string,
    createPortfolioDto: CreatePortfolioDto,
  ) {
    if (
      !(await this.freelancerRepository.findOne({
        where: { id: freelancer_profile_id },
      }))
    )
      throwNotFound('Freelancer not found');
    return {
      success: !!(await this.portfolioRepository.save(
        this.portfolioRepository.create({
          freelancer_profile_id,
          ...createPortfolioDto,
        }),
      )),
    };
  }

  /**
   * Use Case: Get Portfolio Items (Paginated)
   * - list portfolio entries
   * - filter by user
   */
  async findAll(query: PortfolioQueryDto) {
    const { page_number, per_page, freelancer_profile_id } = query;

    const [data, total] = await this.portfolioRepository.findAndCount({
      where: {
        ...(freelancer_profile_id && { freelancer_profile_id }),
      },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get Single Portfolio Item
   * - find portfolio entry with relations
   */
  async findOne(id: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: { freelancer_profile: true },
    });
    if (!portfolio) throwNotFound('Portfolio item not found');
    return portfolio;
  }

  /**
   * Use Case: Update Portfolio Item
   * - verify portfolio entry exists
   * - update portfolio data
   */
  async update(id: string, updatePortfolioDto: UpdatePortfolioDto) {
    await this.findOne(id);
    const { affected } = await this.portfolioRepository.update(
      id,
      updatePortfolioDto,
    );
    if (!affected) throwConflict('Update failed');
    return {
      success: true,
    };
  }

  /**
   * Use Case: Delete Portfolio Item
   * - delete portfolio entry by id
   */
  async remove(id: string) {
    const { affected } = await this.portfolioRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return {
      success: true,
    };
  }
}
