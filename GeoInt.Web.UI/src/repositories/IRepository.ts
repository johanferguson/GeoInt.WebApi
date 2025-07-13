export interface IRepository<T, TId> {
  getAll(): Promise<T[]>;
  getById(id: TId): Promise<T>;
  create(item: Omit<T, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: TId): Promise<void>;
} 