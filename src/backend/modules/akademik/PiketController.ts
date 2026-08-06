import { PiketService } from './services/piket.service';
import { logger } from '../../config/logger';

export class PiketController {
  private service: PiketService;

  constructor() {
    this.service = new PiketService();
  }

  public async handleGetPikets(tenantId: string) {
    logger.info(`API Request: Get Pikets for tenant ${tenantId}`);
    const data = await this.service.findAll(tenantId);
    return {
      statusCode: 200,
      success: true,
      data
    };
  }

  public async handleCreatePiket(tenantId: string, payload: any) {
    logger.info(`API Request: Create Piket`);
    const data = await this.service.create(payload, tenantId);
    return {
      statusCode: 200,
      success: true,
      message: 'Jadwal piket berhasil ditambahkan',
      data
    };
  }

  public async handleUpdatePiket(tenantId: string, payload: any) {
    logger.info(`API Request: Update Piket`);
    const { id, ...updateData } = payload;
    const data = await this.service.update(id, updateData, tenantId);
    return {
      statusCode: 200,
      success: true,
      message: 'Jadwal piket berhasil diperbarui',
      data
    };
  }

  public async handleDeletePiket(tenantId: string, payload: { id: string }) {
    logger.info(`API Request: Delete Piket`);
    await this.service.delete(payload.id, tenantId);
    return {
      statusCode: 200,
      success: true,
      message: 'Jadwal piket berhasil dihapus'
    };
  }
}
export const PiketRouteController = new PiketController();
export default PiketRouteController;
