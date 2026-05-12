import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { throwConflict, throwInternalError } from '../libs/throwError';
import {
  paginationHandler,
  PasswordCheck,
  PasswordHash,
  queryHandler,
} from '../libs/globalFunctions';
import { ConfigService } from '@nestjs/config';
import { PaginationQueryDto } from '../common/pagination-query.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async findAll(query: PaginationQueryDto) {
    try {
      const [data, total] = await this.userRepository.findAndCount({
        ...queryHandler(query),
        order: {
          created_at: 'DESC',
        },
      });

      return paginationHandler(data, total, query.page_number, query.per_page);
    } catch (error) {
      throwInternalError('Failed to fetch');
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throwConflict('User not Found', { field: id });
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    try {
      const { affected } = await this.userRepository.update(id, updateUserDto);

      if (!affected) throwConflict('Update failed', { field: id });

      return { success: true };
    } catch (error) {
      throwInternalError('Failed to update');
    }
  }

  async remove(id: string) {
    try {
      const { affected } = await this.userRepository.delete(id);
      if (!affected) throwConflict('User not found', { field: id });
      return { success: true };
    } catch (error) {
      throwInternalError('Failed to delete');
    }
  }
}
