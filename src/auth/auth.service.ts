import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { throwConflict, throwUnauthorized } from '../libs/throwError';
import { PasswordCheck, PasswordHash } from '../libs/globalFunctions';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Use Case: Register User
   * 1. Check whether the email already exists.
   * 2. Hash the user's password.
   * 3. Create and persist the user.
   * 4. Return a success response.
   */
  async register(dto: CreateUserDto) {
    if (
      await this.userRepository.exists({
        where: { email: dto.email },
      })
    ) {
      throwConflict('Email already exists');
    }

    const hashedPassword = await PasswordHash(
      dto.password,
      this.configService.get<number>('SALT_ROUND') ?? 12,
    );

    await this.userRepository.save(
      this.userRepository.create({
        ...dto,
        password: hashedPassword,
      }),
    );

    return { success: true };
  }

  /**
   * Use Case: Login User
   * 1. Receive an authenticated user from LocalStrategy.
   * 2. Generate access and refresh tokens.
   * 3. Return both tokens.
   */

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    };
  }

  async login(user: User) {
    return {
      ...this.generateTokens(user),
      user: {
        id: user.id,
        name : user.name,
        email: user.email,
        default_workspace: user.default_workspace,
      },
    };
  }

  /**
   * Use Case: Validate User Credentials
   * 1. Find the user by email.
   * 2. Verify the password.
   * 3. Return the authenticated user.
   */
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (
      !user ||
      !user.password ||
      !(await PasswordCheck(password, user.password))
    ) {
      throwUnauthorized('Invalid email or password');
    }

    return user;
  }

  async loginWithFirebase(id_token: string) {
    const decoded = await getAuth().verifyIdToken(id_token);
    const { email, uid } = decoded;
    if (!email) throwUnauthorized('Google acc has no email');
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = this.userRepository.create({
        email,
        firebase_uid: uid,
        provider: 'google',
        is_active: true,
      });
      await this.userRepository.save(user);
    } else if (!user.firebase_uid) {
      // account existed via email/password, now also linked to google
      user.firebase_uid = uid;
      await this.userRepository.save(user);
    }
    return this.login(user);
  }

  /**
   * Use Case: Get Current User Profile
   * 1. Retrieve the user by id.
   * 2. Return only public profile fields.
   * 3. Throw if the user does not exist.
   */
  async me(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      select: ['id', 'email', 'created_at', 'updated_at'],
    });

    if (!user) {
      throwUnauthorized('User not found');
    }

    return user;
  }
}
