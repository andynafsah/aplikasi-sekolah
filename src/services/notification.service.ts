import { INotificationRepository } from '../domain/repositories/INotificationRepository';
import { PrismaEngine } from '../backend/database/prisma';

export class NotificationService {
  constructor(private readonly notificationRepository?: INotificationRepository) {}

  /**
   * Triggers a notification, applies deduplication (cooldown), maps channels, and persists it.
   */
  public static async triggerNotification(params: {
    recipient_id: string;
    type: string; // "student_attendance_created", "late_attendance", "qr_invalid", "gps_outside_radius", "system_notice", etc.
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    data?: any;
    tenant_id?: string;
    channels?: ('IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PUSH')[];
  }): Promise<any> {
    const tenant_id = params.tenant_id || 'system';
    const channels = params.channels || ['IN_APP'];

    // Deduplication Key / Cooldown (5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await PrismaEngine.notification.findFirst({
      where: {
        recipient_id: params.recipient_id,
        type: params.type,
        entity_id: params.entity_id || null,
        created_at: { gte: fiveMinutesAgo }
      }
    });

    if (duplicate) {
      console.log(`[Deduplication Engine] Skip duplicate notification for recipient ${params.recipient_id}, type ${params.type} (cooldown active)`);
      return duplicate;
    }

    const createdNotifications = [];

    // Save in database
    for (const channel of channels) {
      let mappedType = params.type;
      if (channel === 'EMAIL') {
        mappedType = 'EMAIL';
      } else if (channel === 'WHATSAPP') {
        mappedType = 'WHATSAPP';
      }

      const notif = await PrismaEngine.notification.create({
        data: {
          recipient_id: params.recipient_id,
          recipient: params.recipient_id, // Compatibility with previous models
          type: mappedType,
          title: params.title,
          message: params.message,
          entity_type: params.entity_type || null,
          entity_id: params.entity_id || null,
          data: params.data ? JSON.stringify(params.data) : null,
          status: channel === 'IN_APP' ? 'UNREAD' : 'PENDING',
          tenant_id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      createdNotifications.push(notif);

      // Trigger channel-specific side-effects
      if (channel === 'PUSH') {
        const devices = await PrismaEngine.device.findMany({
          where: { user_id: params.recipient_id }
        });
        for (const device of devices) {
          await PrismaEngine.pushNotification.create({
            data: {
              device_id: device.id,
              user_id: params.recipient_id,
              title: params.title,
              body: params.message,
              payload: params.data ? params.data : {},
              status: 'PENDING'
            }
          });
        }
      } else if (channel === 'EMAIL') {
        try {
          await (PrismaEngine as any).emailMessage.create({
            data: {
              recipient_email: params.recipient_id,
              subject: params.title,
              body: params.message,
              status: 'PENDING'
            }
          });
        } catch (e) {
          console.warn('[Notification Service] Failed to log EmailMessage:', e);
        }
      }
    }

    return createdNotifications[0];
  }

  public async getNotifications(tenantId: string): Promise<any[]> {
    return await PrismaEngine.notification.findMany({
      where: { tenant_id: tenantId }
    });
  }

  public async createNotification(data: any, tenantId: string): Promise<any> {
    return await PrismaEngine.notification.create({
      data: {
        ...data,
        tenant_id: tenantId
      }
    });
  }
}

export default NotificationService;
