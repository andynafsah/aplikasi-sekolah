import { BaseRepository } from './base.repository';
import { IAuthRepository } from '../domain/repositories/IAuthRepository';

export class AuthRepository extends BaseRepository<any> implements IAuthRepository {
  constructor() {
    super('users');
  }

  public async findByUsername(username: string): Promise<any | null> {
    return await this.findOne({ username });
  }

  public async findByEmail(email: string): Promise<any | null> {
    return await this.findOne({ email });
  }
}
export default AuthRepository;
