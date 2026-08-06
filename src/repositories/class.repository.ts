import { BaseRepository } from './base.repository';
import { IClassRepository } from '../domain/repositories/IClassRepository';

export class ClassRepository extends BaseRepository<any> implements IClassRepository {
  constructor() {
    super('classes');
  }
}
export default ClassRepository;
