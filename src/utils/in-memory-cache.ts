export class InMemoryCache {
  private cache: Record<string, any>;

  constructor() {
    this.cache = {};
  }

  set(key: string, value: any): void {
    this.cache[key] = value;
  }

  get(key: string): any | null {
    if (key in this.cache) {
      return this.cache[key];
    }
    return null;
  }
}

export const cache = new InMemoryCache();
