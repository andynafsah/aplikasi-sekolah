import { ISettingRepository } from '../domain/repositories/ISettingRepository';

export class SettingService {
  constructor(private readonly settingRepository: ISettingRepository) {}

  public async getSettings(tenantId: string): Promise<any[]> {
    return await this.settingRepository.findAll(tenantId);
  }

  public async updateSetting(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.settingRepository.update(id, data, tenantId);
  }
}
export default SettingService;
