/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseEntity } from './index';

export type CommunicationChannel = 'IN_APP' | 'WHATSAPP' | 'EMAIL' | 'PUSH' | 'SMS';

export type AnnouncementStatus = 'Draft' | 'Sent' | 'Archived';

export type DeliveryStatus = 'Pending' | 'Delivered' | 'Failed' | 'Queued';

export interface AnnouncementCategory extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
}

export interface Announcement extends BaseEntity {
  title: string;
  content: string;
  type: string; // Kategori (e.g., Informasi, Akademik, Keuangan, dll.)
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  is_pinned: boolean;
  status: AnnouncementStatus;
  sender_id: string;
  sender_name: string;
  channels: string; // JSON string of CommunicationChannel[]
  recipients_filter: string; // JSON string of recipient filter criteria
  scheduled_at: string | null;
  attachments?: string; // JSON string of file attachments
}

export interface AnnouncementTarget extends BaseEntity {
  announcement_id: string;
  role: string;
  filter_unit?: string;
  filter_class?: string;
  filter_dorm?: string;
}

export interface AnnouncementRead extends BaseEntity {
  announcement_id: string;
  user_id: string;
  read_at: string;
  feedback?: string;
}

export interface Broadcast extends BaseEntity {
  name: string;
  description?: string;
  channel_name: CommunicationChannel;
  template_id?: string;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Cancelled';
  scheduled_cron?: string; // e.g. for recurring SPP, weekly, monthly
  recurrence_type?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
}

export interface BroadcastLog extends BaseEntity {
  broadcast_id: string;
  recipient_name: string;
  recipient_phone?: string;
  recipient_email?: string;
  channel: CommunicationChannel;
  status: DeliveryStatus;
  error_message?: string;
  read_at?: string;
  retry_count: number;
}

export interface MessageTemplate extends BaseEntity {
  name: string;
  channel_name: CommunicationChannel;
  subject?: string;
  body: string;
  variables: string[]; // e.g., ["nama", "kelas", "unit", "wali", "tagihan", "tanggal"]
  status: 'ACTIVE' | 'INACTIVE';
}

export interface NotificationQueue extends BaseEntity {
  channel_name: string; // WhatsApp, Email, Push Notification, SMS
  recipient: string;
  payload: string; // JSON string
  status: 'Pending' | 'Delivered' | 'Failed' | 'Queued';
  retry_count: number;
  scheduled_at?: string;
}

export interface NotificationLog extends BaseEntity {
  queue_id: string;
  channel: CommunicationChannel;
  sender_name: string;
  recipient: string;
  subject?: string;
  body: string;
  status: DeliveryStatus;
  sent_at: string;
  read_at?: string;
}

export interface EmailLog extends BaseEntity {
  log_id: string;
  sender: string;
  recipient: string;
  subject: string;
  status: DeliveryStatus;
  error?: string;
}

export interface WhatsappLog extends BaseEntity {
  log_id: string;
  instance_id: string;
  recipient: string;
  message: string;
  status: DeliveryStatus;
  error?: string;
}

export interface PushLog extends BaseEntity {
  log_id: string;
  recipient_user_id: string;
  title: string;
  body: string;
  status: DeliveryStatus;
  error?: string;
}

export interface CommunicationSettings {
  logo?: string;
  nama_yayasan: string;
  nama_sekolah: string;
  preferred_broadcast_hour_start: string;
  preferred_broadcast_hour_end: string;
  header_template?: string;
  footer_template?: string;
  
  // Gateways
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_secure: boolean;
  smtp_from_email?: string;
  
  wa_gateway_url?: string;
  wa_api_key?: string;
  wa_instance_status: 'CONNECTED' | 'DISCONNECTED' | 'AUTHENTICATING';
  
  push_fcm_sender_id?: string;
  push_fcm_server_key?: string;
  push_badge_sync_enabled: boolean;
}
