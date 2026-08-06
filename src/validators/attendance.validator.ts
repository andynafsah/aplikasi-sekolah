import { CheckInDTO } from '../domain/dtos/attendance.dto';

export class AttendanceValidator {
  public static validateCheckIn(data: CheckInDTO): { isValid: boolean; message?: string } {
    if (!data.personId || data.personId.trim() === '') {
      return { isValid: false, message: 'ID Person wajib diisi.' };
    }
    if (!data.name || data.name.trim() === '') {
      return { isValid: false, message: 'Nama Person wajib diisi.' };
    }
    if (!data.role) {
      return { isValid: false, message: 'Peran (Role) wajib dipilih.' };
    }
    if (!data.type) {
      return { isValid: false, message: 'Tipe absensi (MASUK/PULANG/dll) wajib dipilih.' };
    }
    if (!data.method) {
      return { isValid: false, message: 'Metode absensi (GPS/QR/dll) wajib dipilih.' };
    }

    // GPS Geofence Check
    if (data.method === 'GPS') {
      if (data.lat === undefined || data.lng === undefined) {
        return { isValid: false, message: 'Koordinat GPS (Latitude/Longitude) diperlukan untuk presensi GPS.' };
      }
    }

    // QR Token Validation
    if (data.method === 'QR' && (!data.qrToken || data.qrToken.trim() === '')) {
      return { isValid: false, message: 'Token QR Code diperlukan untuk presensi QR.' };
    }

    // Barcode Validation
    if (data.method === 'BARCODE' && (!data.barcodeData || data.barcodeData.trim() === '')) {
      return { isValid: false, message: 'Data Barcode diperlukan untuk presensi Barcode.' };
    }

    return { isValid: true };
  }
}
