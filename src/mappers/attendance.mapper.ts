import { CheckInDTO } from '../domain/dtos/attendance.dto';

export class AttendanceMapper {
  public static toEntity(dto: CheckInDTO, tenantId: string): any {
    return {
      id: dto.offlineQueueId || `att-ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      person_id: dto.personId,
      name: dto.name,
      role: dto.role,
      date: dto.timestamp ? dto.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
      time: dto.timestamp ? dto.timestamp.split('T')[1]?.substring(0, 5) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: dto.type,
      status: dto.status || 'HADIR',
      method: dto.method,
      details: dto.details || `Presensi via ${dto.method}`,
      latitude: dto.lat || null,
      longitude: dto.lng || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
  }

  public static toResponse(entity: any): any {
    return {
      id: entity.id,
      personId: entity.person_id || entity.personId,
      name: entity.name,
      role: entity.role,
      date: entity.date,
      time: entity.time,
      type: entity.type,
      status: entity.status,
      method: entity.method,
      details: entity.details,
      lat: entity.latitude || entity.lat,
      lng: entity.longitude || entity.lng,
      timestamp: `${entity.date}T${entity.time}:00`
    };
  }
}
