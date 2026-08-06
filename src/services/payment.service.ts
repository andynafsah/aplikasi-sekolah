import { IPaymentRepository } from '../domain/repositories/IPaymentRepository';

export class PaymentService {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  public async getPayments(tenantId: string): Promise<any[]> {
    return await this.paymentRepository.findAll(tenantId);
  }

  public async getPaymentById(id: string, tenantId: string): Promise<any | null> {
    return await this.paymentRepository.findById(id, tenantId);
  }

  public async createPayment(data: any, tenantId: string): Promise<any> {
    return await this.paymentRepository.create(data, tenantId);
  }

  public async updatePayment(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.paymentRepository.update(id, data, tenantId);
  }
}
export default PaymentService;
