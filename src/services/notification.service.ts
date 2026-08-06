import { INotificationRepository } from '../domain/repositories/INotificationRepository';

export class NotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  public async getNotifications(tenantId: string): Promise<any[]> {
    return await this.notificationRepository.findAll(tenantId);
  }

  public async createNotification(data: any, tenantId: string): Promise<any> {
    return await this.notificationRepository.create(data, tenantId);
  }
}
export default NotificationService;
