import { BaseRepository } from './base.repository';
import { ISubjectRepository } from '../domain/repositories/ISubjectRepository';

export class SubjectRepository extends BaseRepository<any> implements ISubjectRepository {
  constructor() {
    super('subjects');
  }
}
export default SubjectRepository;
