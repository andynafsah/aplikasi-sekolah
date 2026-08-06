import { IAuthRepository } from '../domain/repositories/IAuthRepository';

export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  public async authenticate(usernameOrEmail: string, passwordPlain: string): Promise<any | null> {
    let user = await this.authRepository.findByUsername(usernameOrEmail);
    if (!user) {
      user = await this.authRepository.findByEmail(usernameOrEmail);
    }
    if (!user || user.password !== passwordPlain) {
      return null;
    }
    return user;
  }

  public async getUserById(id: string): Promise<any | null> {
    return await this.authRepository.findById(id);
  }
}
export default AuthService;
