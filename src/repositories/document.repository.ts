import { BaseRepository } from './base.repository';
import { IDocumentRepository } from '../domain/repositories/IDocumentRepository';

export class DocumentRepository extends BaseRepository<any> implements IDocumentRepository {
  constructor() {
    super('documents');
  }
}
export default DocumentRepository;
