import { IReportRepository } from '../domain/repositories/IReportRepository';

export class ReportService {
  constructor(private readonly reportRepository: IReportRepository) {}

  public async getReports(tenantId: string): Promise<any[]> {
    return await this.reportRepository.findAll(tenantId);
  }

  public async getReportById(id: string, tenantId: string): Promise<any | null> {
    return await this.reportRepository.findById(id, tenantId);
  }

  public async createReport(data: any, tenantId: string): Promise<any> {
    return await this.reportRepository.create(data, tenantId);
  }
}
export default ReportService;
