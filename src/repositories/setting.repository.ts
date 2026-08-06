import { BaseRepository } from './base.repository';
import { ISettingRepository } from '../domain/repositories/ISettingRepository';

export class SettingRepository extends BaseRepository<any> implements ISettingRepository {
  constructor() {
    super('brandings');
  }
}
export default SettingRepository;
