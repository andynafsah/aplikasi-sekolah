import { BaseRepository } from './base.repository';
import { IReportRepository } from '../domain/repositories/IReportRepository';

export class ReportRepository extends BaseRepository<any> implements IReportRepository {
  constructor() {
    super('reports');
  }
}
export default ReportRepository;
