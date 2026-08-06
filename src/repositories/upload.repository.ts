import { BaseRepository } from './base.repository';
import { IUploadRepository } from '../domain/repositories/IUploadRepository';

export class UploadRepository extends BaseRepository<any> implements IUploadRepository {
  constructor() {
    super('uploads');
  }
}
export default UploadRepository;
