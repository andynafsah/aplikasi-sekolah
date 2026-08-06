import { BaseRepository } from './base.repository';
import { INotificationRepository } from '../domain/repositories/INotificationRepository';

export class NotificationRepository extends BaseRepository<any> implements INotificationRepository {
  constructor() {
    super('notifications');
  }
}
export default NotificationRepository;
