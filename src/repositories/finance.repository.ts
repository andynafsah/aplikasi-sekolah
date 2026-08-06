import { BaseRepository } from './base.repository';
import { IFinanceRepository } from '../domain/repositories/IFinanceRepository';

export class FinanceRepository extends BaseRepository<any> implements IFinanceRepository {
  constructor() {
    super('finance_transactions');
  }

  public async getSummary(tenantId?: string): Promise<any> {
    const list = await this.findAll(tenantId);
    let totalIncome = 0;
    let totalExpense = 0;
    for (const item of list) {
      if (item.type === 'INCOME') {
        totalIncome += Number(item.amount || 0);
      } else if (item.type === 'EXPENSE') {
        totalExpense += Number(item.amount || 0);
      }
    }
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }
}
export default FinanceRepository;
