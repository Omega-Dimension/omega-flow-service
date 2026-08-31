import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unread')
  findUnread(@GetUser() user: JwtUser) {
    return this.notificationService.findUnread(user.id);
  }

  @Get()
  findAll(@GetUser() user: JwtUser) {
    return this.notificationService.findAll(user.id);
  }

  @Patch('mark-read')
  markRead(@GetUser() user: JwtUser, @Body() dto: { ids: string[] }) {
    return this.notificationService.markRead(user.id, dto.ids);
  }

  @Patch('mark-all-read')
  markAllRead(@GetUser() user: JwtUser) {
    return this.notificationService.markAllRead(user.id);
  }
}