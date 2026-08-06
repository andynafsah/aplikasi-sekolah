import { IFinanceRepository } from '../domain/repositories/IFinanceRepository';

export class FinanceService {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  public async getTransactions(tenantId: string): Promise<any[]> {
    return await this.financeRepository.findAll(tenantId);
  }

  public async getTransactionById(id: string, tenantId: string): Promise<any | null> {
    return await this.financeRepository.findById(id, tenantId);
  }

  public async createTransaction(data: any, tenantId: string): Promise<any> {
    return await this.financeRepository.create(data, tenantId);
  }

  public async getFinanceSummary(tenantId: string): Promise<any> {
    return await this.financeRepository.getSummary(tenantId);
  }
}
export default FinanceService;
