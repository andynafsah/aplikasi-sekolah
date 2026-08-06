import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository';

export class EmployeeService {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  public async getEmployees(tenantId: string): Promise<any[]> {
    return await this.employeeRepository.findAll(tenantId);
  }

  public async getEmployeeById(id: string, tenantId: string): Promise<any | null> {
    return await this.employeeRepository.findById(id, tenantId);
  }

  public async createEmployee(data: any, tenantId: string): Promise<any> {
    return await this.employeeRepository.create(data, tenantId);
  }

  public async updateEmployee(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.employeeRepository.update(id, data, tenantId);
  }

  public async deleteEmployee(id: string, tenantId: string): Promise<boolean> {
    return await this.employeeRepository.softDelete(id, tenantId);
  }

  public async searchEmployees(query: string, tenantId: string): Promise<any[]> {
    return await this.employeeRepository.search(query, tenantId);
  }
}
export default EmployeeService;
