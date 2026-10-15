/** Shared keys for versioned Pinia persistence and UI preferences. */
export class StorageConfig {
  static readonly CURRENT_VERSION = __APP_VERSION__
  static readonly STORAGE_PREFIX = 'sys-v'
  static readonly THEME_KEY = 'sys-theme'
  static readonly RESPONSIVE_MENU_TYPE_KEY = 'sys-responsive-menu-type'

  static generateStorageKey(storeId: string, version: string = this.CURRENT_VERSION): string {
    return `${this.STORAGE_PREFIX}${version}-${storeId}`
  }

  static createKeyPattern(storeId: string): RegExp {
    return new RegExp(`^${this.STORAGE_PREFIX}[^-]+-${storeId}$`)
  }
}
