/**
 * Lightweight, type-safe Dependency Injection (DI) Container for the Enterprise Stack.
 * Decouples creation logic from usage, allowing smooth unit tests and adapter swappings.
 */
export class DependencyContainer {
  private static instance: DependencyContainer;
  private registry: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Return the global singleton instance of the Dependency Container
   */
  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  /**
   * Register a dynamic dependency instance or provider singleton
   */
  public register<T>(token: string, instance: T): void {
    this.registry.set(token, instance);
  }

  /**
   * Resolve a registered dependency from the container
   */
  public resolve<T>(token: string): T {
    const dependency = this.registry.get(token);
    if (!dependency) {
      throw new Error(`[DependencyContainer] Gagal menyelesaikan dependensi "${token}". Pastikan sudah diregistrasi.`);
    }
    return dependency;
  }

  /**
   * Check if a specific token is registered
   */
  public has(token: string): boolean {
    return this.registry.has(token);
  }

  /**
   * Clear the registered dependencies (useful between test cases)
   */
  public clear(): void {
    this.registry.clear();
  }
}

export const container = DependencyContainer.getInstance();
export default container;
