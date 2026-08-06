import { describe, it, expect } from 'vitest';
import { BaseEntity, BaseEntityProps } from '../../domain/entity.base';

interface MockProps extends BaseEntityProps {
  name: string;
  role: string;
}

class MockEntity extends BaseEntity<MockProps> {
  public get name(): string {
    return this.props.name;
  }

  public get role(): string {
    return this.props.role;
  }
}

describe('BaseEntity', () => {
  it('should initialize correctly with provided props and default timestamps', () => {
    const props: MockProps = {
      id: 'entity-123',
      name: 'Pesantren Al-Hikmah',
      role: 'Institusi',
    };

    const entity = new MockEntity(props);

    expect(entity.id).toBe('entity-123');
    expect(entity.name).toBe('Pesantren Al-Hikmah');
    expect(entity.role).toBe('Institusi');
    expect(entity.tenantId).toBeUndefined();
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow setting tenantId dynamically', () => {
    const entity = new MockEntity({ name: 'Sub-Unit', role: 'Tenant' });
    expect(entity.tenantId).toBeUndefined();

    entity.setTenantId('tenant-999');
    expect(entity.tenantId).toBe('tenant-999');
  });

  it('should update modification timestamp when touch is invoked', async () => {
    const entity = new MockEntity({ name: 'Editable', role: 'Staff' });
    const initialUpdatedAt = entity.updatedAt;

    // Wait short time to ensure time difference
    await new Promise((resolve) => setTimeout(resolve, 5));

    entity.touch();
    expect(entity.updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt!.getTime());
  });

  it('should serialize correctly to an object with ISO-strings for dates', () => {
    const now = new Date();
    const entity = new MockEntity({
      id: 'entity-abc',
      name: 'Serialization Test',
      role: 'Admin',
      createdAt: now,
      updatedAt: now,
    });

    const obj = entity.toObject();

    expect(obj.id).toBe('entity-abc');
    expect(obj.name).toBe('Serialization Test');
    expect(obj.createdAt).toBe(now.toISOString());
    expect(obj.updatedAt).toBe(now.toISOString());
  });

  it('should perform strict identity-based equality comparisons', () => {
    const entityA1 = new MockEntity({ id: 'ident-1', name: 'Original', role: 'Standard' });
    const entityA2 = new MockEntity({ id: 'ident-1', name: 'Updated name', role: 'Standard' });
    const entityB = new MockEntity({ id: 'ident-2', name: 'Different', role: 'Standard' });
    const entityNoId = new MockEntity({ name: 'No ID', role: 'Standard' });

    expect(entityA1.equals(entityA2)).toBe(true);
    expect(entityA1.equals(entityB)).toBe(false);
    expect(entityA1.equals(undefined)).toBe(false);
    expect(entityA1.equals(entityNoId)).toBe(false);
  });
});
