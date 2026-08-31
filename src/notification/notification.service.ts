import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly socketService: SocketService,
  ) {}

  /**
   * DB ထဲ notification သိမ်းမယ် + online ဖြစ်နေရင် real-time ပို့မယ်
   * meeting module (ဒါမှမဟုတ် အခြား module) ကနေ ဒီတစ်ခုတည်း ခေါ်ရုံပဲ လိုတော့မယ်
   */
  async notifyUser(user_id: string, type: string, payload: Record<string, any>) {
    if (!user_id) return;

    await this.notificationRepository.save({
      user_id,
      type,
      payload,
      is_read: false,
    });

    this.socketService.emitToUser(user_id, type, payload);
  }

  async findUnread(user_id: string) {
    return this.notificationRepository.find({
      where: { user_id, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async findAll(user_id: string) {
    return this.notificationRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markRead(user_id: string, ids: string[]) {
    if (!ids?.length) return { success: true };
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true })
      .where('user_id = :user_id AND id IN (:...ids)', { user_id, ids })
      .execute();
    return { success: true };
  }

  async markAllRead(user_id: string) {
    await this.notificationRepository.update(
      { user_id, is_read: false },
      { is_read: true },
    );
    return { success: true };
  }
}