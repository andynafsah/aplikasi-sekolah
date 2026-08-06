import { BaseRepository } from './base.repository';
import { IPpdbRepository } from '../domain/repositories/IPpdbRepository';

export class PpdbRepository extends BaseRepository<any> implements IPpdbRepository {
  constructor() {
    super('ppdb_registrations');
  }
}
export default PpdbRepository;
