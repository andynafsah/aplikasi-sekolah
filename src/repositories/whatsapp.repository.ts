import { BaseRepository } from './base.repository';
import { IWhatsappRepository } from '../domain/repositories/IWhatsappRepository';

export class WhatsappRepository extends BaseRepository<any> implements IWhatsappRepository {
  constructor() {
    super('whatsapp_messages');
  }
}
export default WhatsappRepository;
