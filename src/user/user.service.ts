import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { throwConflict, throwNotFound } from '../libs/throwError';
import {
  paginationHandler,
  paginationQueryHandler,
  PasswordHash,
} from '../libs/globalFunctions';
import { ConfigService } from '@nestjs/config';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserQueryDto } from './dto/query.dto';
@Injectable()
export class UserService {
  constructor(
    // User database repository
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Access environment configuration
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (
      await this.userRepository.exists({
        where: { email: createUserDto.email },
      })
    )
      throwConflict('Email already exists', { field: 'email' });

    return {
      success: !!(await this.userRepository.save(
        this.userRepository.create({
          ...createUserDto,

          password: await PasswordHash(
            createUserDto.password,
            this.configService.get<number>('SALT_ROUND') || 12,
          ),
        }),
      )),
    };
  }

  async findAll(query: UserQueryDto) {
    const { page_number, per_page, email, company_name } = query;
    const [data, total] = await this.userRepository.findAndCount({
      where: {
        ...(email && { email: ILike(`%${email}%`) }),
        ...(company_name && { company_name: ILike(`%${company_name}%`) }),
      },
      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throwNotFound('User not Found', { field: id });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { affected } = await this.userRepository.update(id, updateUserDto);

    if (!affected) throwConflict('Update failed', { field: id });

    return { success: true };
  }

  async remove(id: string) {
    const { affected } = await this.userRepository.delete(id);

    if (!affected) throwConflict('Delete failed', { field: id });

    return { success: true };
  }
}
