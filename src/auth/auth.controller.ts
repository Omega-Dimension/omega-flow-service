import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { FirebaseLoginDto } from './dto/login.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@GetUser() user: User) {
    return this.authService.login(user);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  loginWithGoogle(@Body() dto: FirebaseLoginDto) {
    return this.authService.loginWithFirebase(dto.id_token);
  }

@Public()
@UseGuards(JwtRefreshAuthGuard)
@Post('refresh')
@HttpCode(HttpStatus.OK)
refresh(@GetUser() user: JwtUser) {
  return this.authService.refreshTokens(user.id);
}

  @Get('me')
  me(@GetUser() user: JwtUser) {
    return this.authService.me(user.id);
  }
}
