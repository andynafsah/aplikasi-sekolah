import { IBaseRepository } from './IBaseRepository';

export interface IAuthRepository extends IBaseRepository<any> {
  findByUsername(username: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
}
