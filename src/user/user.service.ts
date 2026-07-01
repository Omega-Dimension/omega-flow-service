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

  /**
   * Use Case: Create User
   * - check duplicate email
   * - hash password
   * - create user
   */
  async create(createUserDto: CreateUserDto) {
    if (
      await this.userRepository.exists({
        where: { email: createUserDto.email },
      })
    )
      throwConflict('Email already exists');

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
  /**
   * Use Case: Get Users (Paginated)
   * - list users
   * - filter by email/company
   * - return paginated result
   */
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

  /**
   * Use Case: Get Single User
   * - find user by id
   */

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throwNotFound('User not Found');

    return user;
  }

  /**
   * Use Case: Update User
   * - verify user exists
   * - update user data
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { affected } = await this.userRepository.update(id, updateUserDto);

    if (!affected) throwConflict('Update failed');

    return { success: true };
  }
  /**
   * Use Case: Delete User
   * - delete user by id
   */
  async remove(id: string) {
    const { affected } = await this.userRepository.delete(id);

    if (!affected) throwConflict('Delete failed');

    return { success: true };
  }
}
