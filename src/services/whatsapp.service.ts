import { IWhatsappRepository } from '../domain/repositories/IWhatsappRepository';

export class WhatsappService {
  constructor(private readonly whatsappRepository: IWhatsappRepository) {}

  public async getMessages(tenantId: string): Promise<any[]> {
    return await this.whatsappRepository.findAll(tenantId);
  }

  public async sendMessage(data: any, tenantId: string): Promise<any> {
    return await this.whatsappRepository.create(data, tenantId);
  }
}
export default WhatsappService;
