import { BaseRepository } from './base.repository';
import { IBarcodeRepository } from '../domain/repositories/IBarcodeRepository';

export class BarcodeRepository extends BaseRepository<any> implements IBarcodeRepository {
  constructor() {
    super('barcodes');
  }
}
export default BarcodeRepository;
