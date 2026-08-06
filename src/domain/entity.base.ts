export interface BaseEntityProps {
  id?: string;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class BaseEntity<T extends BaseEntityProps = BaseEntityProps> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  public get id(): string | undefined {
    return this.props.id;
  }

  public get tenantId(): string | undefined {
    return this.props.tenantId;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  /**
   * Sets or updates the entity tenant context
   */
  public setTenantId(tenantId: string): void {
    this.props.tenantId = tenantId;
  }

  /**
   * Updates modification timestamp
   */
  public touch(): void {
    this.props.updatedAt = new Date();
  }

  /**
   * Serializes entity to a plain JS Object for transmission/response layers
   */
  public toObject(): T & { id?: string; createdAt: string; updatedAt: string } {
    return {
      ...this.props,
      createdAt: this.props.createdAt?.toISOString(),
      updatedAt: this.props.updatedAt?.toISOString(),
    } as any;
  }

  /**
   * Strict equality comparison based on entity identity
   */
  public equals(other?: BaseEntity<T>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (this.id === undefined || other.id === undefined) return false;
    return this.id === other.id;
  }
}
export default BaseEntity;
