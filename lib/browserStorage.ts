type StorageShim = Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear" | "key"> & {
  length: number;
};

function createMemoryStorage(): StorageShim {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries.clear();
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    getItem(key: string) {
      return entries.has(key) ? entries.get(key)! : null;
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    },
    removeItem(key: string) {
      entries.delete(key);
    },
  };
}

export function ensureBrowserStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const storage = window.localStorage;

  if (
    storage &&
    typeof storage.getItem === "function" &&
    typeof storage.setItem === "function" &&
    typeof storage.removeItem === "function"
  ) {
    return;
  }

  const fallbackStorage = createMemoryStorage();

  try {
    Object.defineProperty(window, "localStorage", {
      value: fallbackStorage,
      configurable: true,
    });
  } catch {
    (window as Window & { localStorage: StorageShim }).localStorage = fallbackStorage;
  }
}

function getStorage(): StorageShim {
  if (typeof window === "undefined") {
    return createMemoryStorage();
  }

  ensureBrowserStorage();
  return window.localStorage as unknown as StorageShim;
}

export function readStorageItem(key: string): string | null {
  return getStorage().getItem(key);
}

export function writeStorageItem(key: string, value: string): void {
  getStorage().setItem(key, value);
}

export function removeStorageItem(key: string): void {
  getStorage().removeItem(key);
}
