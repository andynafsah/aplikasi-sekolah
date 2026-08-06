import { BaseRepository } from './base.repository';
import { IPaymentRepository } from '../domain/repositories/IPaymentRepository';

export class PaymentRepository extends BaseRepository<any> implements IPaymentRepository {
  constructor() {
    super('payments');
  }
}
export default PaymentRepository;
