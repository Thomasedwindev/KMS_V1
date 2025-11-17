import { jsonStorage } from './jsonStorage';

/**
 * Utility functions for data management and debugging
 * These are optional helper functions for development and maintenance
 */

export const storageUtils = {
  /**
   * Get human-readable storage statistics
   */
  getStats() {
    const data = jsonStorage.getAllData();
    const stats = {
      code_docs: data.code_docs.length,
      query_library: data.query_library.length,
      error_logs: data.error_logs.length,
      sop_library: data.sop_library.length,
      flows: data.flows.length,
      total_items: 0,
      storage_size_kb: 0
    };

    stats.total_items = Object.values(stats).reduce((a, b) => 
      typeof b === 'number' && b > 0 ? a + b : a, 0
    ) - 2; // Exclude total_items and storage_size_kb from sum

    // Estimate storage size
    const jsonString = JSON.stringify(data);
    stats.storage_size_kb = Math.round((jsonString.length / 1024) * 100) / 100;

    return stats;
  },

  /**
   * Print storage statistics to console
   */
  printStats() {
    const stats = this.getStats();
    console.table(stats);
  },

  /**
   * Search across all tables for a keyword
   */
  async globalSearch(keyword: string) {
    const keywordLower = keyword.toLowerCase();
    const results: any[] = [];

    const data = jsonStorage.getAllData();

    // Search code docs
    data.code_docs.forEach((doc: any) => {
      if (
        doc.filename?.toLowerCase().includes(keywordLower) ||
        doc.summary?.toLowerCase().includes(keywordLower)
      ) {
        results.push({ type: 'code_docs', item: doc });
      }
    });

    // Search queries
    data.query_library.forEach((query: any) => {
      if (
        query.query_text?.toLowerCase().includes(keywordLower) ||
        query.category?.toLowerCase().includes(keywordLower)
      ) {
        results.push({ type: 'query_library', item: query });
      }
    });

    // Search errors
    data.error_logs.forEach((error: any) => {
      if (
        error.filename?.toLowerCase().includes(keywordLower) ||
        error.summary?.toLowerCase().includes(keywordLower)
      ) {
        results.push({ type: 'error_logs', item: error });
      }
    });

    // Search SOPs
    data.sop_library.forEach((sop: any) => {
      if (sop.title?.toLowerCase().includes(keywordLower)) {
        results.push({ type: 'sop_library', item: sop });
      }
    });

    // Search flows
    data.flows.forEach((flow: any) => {
      if (flow.title?.toLowerCase().includes(keywordLower)) {
        results.push({ type: 'flows', item: flow });
      }
    });

    return results;
  },

  /**
   * Create a backup file with timestamp
   */
  createBackup() {
    const timestamp = new Date().toISOString().split('T')[0];
    const data = jsonStorage.getAllData();
    const dataStr = JSON.stringify(data, null, 2);

    return {
      filename: `kms-backup-${timestamp}.json`,
      data: dataStr,
      timestamp: new Date().toISOString(),
      itemCount: this.getStats().total_items
    };
  },

  /**
   * Validate if data structure is correct
   */
  validateData(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const data = jsonStorage.getAllData();

    const requiredTables: (keyof typeof data)[] = ['code_docs', 'query_library', 'error_logs', 'sop_library', 'flows'];
    requiredTables.forEach((table) => {
      if (!(table in data)) {
        errors.push(`Missing table: ${table}`);
      } else if (!Array.isArray(data[table])) {
        errors.push(`Table ${table} is not an array`);
      }
    });

    // Check if items have required fields
    data.code_docs.forEach((doc: any, idx: number) => {
      if (!doc.id) errors.push(`code_docs[${idx}] missing id`);
      if (!doc.filename) errors.push(`code_docs[${idx}] missing filename`);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Get storage size information
   */
  getStorageInfo() {
    const data = jsonStorage.getAllData();
    const jsonString = JSON.stringify(data);
    const sizeBytes = new Blob([jsonString]).size;
    const sizeKb = Math.round((sizeBytes / 1024) * 100) / 100;
    const sizeMb = Math.round((sizeKb / 1024) * 100) / 100;

    // Browser storage limit is typically 5-10 MB
    const percentUsed = Math.round((sizeKb / (5 * 1024)) * 100);

    return {
      bytes: sizeBytes,
      kilobytes: sizeKb,
      megabytes: sizeMb,
      percentOfLimit: Math.min(percentUsed, 100),
      limitReached: percentUsed > 80
    };
  },

  /**
   * Clear specific table
   */
  async clearTable(table: keyof any) {
    const data = jsonStorage.getAllData();
    (data as any)[table] = [];
    jsonStorage.clearAll();
    
    // Restore other tables
    const filtered: any = {};
    Object.keys(data).forEach((key) => {
      if (key !== table) {
        filtered[key] = (data as any)[key];
      } else {
        filtered[key] = [];
      }
    });

    // Re-insert data minus the cleared table
    // (Note: This is a simplified approach; in production you'd use a better method)
    localStorage.setItem('kms_prototype_data', JSON.stringify(filtered));
  },

  /**
   * Merge data from an external source (careful with this!)
   */
  async mergeData(externalData: any): Promise<{ success: boolean; message: string }> {
    try {
      const currentData = jsonStorage.getAllData();
      const tables: (keyof typeof currentData)[] = ['code_docs', 'query_library', 'error_logs', 'sop_library', 'flows'];

      let mergedCount = 0;
      tables.forEach((table) => {
        if (externalData[table] && Array.isArray(externalData[table])) {
          const externalItems = externalData[table];
          const currentIds = new Set(currentData[table].map((item: any) => item.id));

          externalItems.forEach((item: any) => {
            if (!currentIds.has(item.id)) {
              currentData[table].push(item);
              mergedCount++;
            }
          });
        }
      });

      localStorage.setItem('kms_prototype_data', JSON.stringify(currentData));
      return {
        success: true,
        message: `Successfully merged ${mergedCount} new items`
      };
    } catch (error) {
      return {
        success: false,
        message: `Merge failed: ${error}`
      };
    }
  }
};

// Export helper for console debugging
if (typeof window !== 'undefined') {
  (window as any).kmsDebug = {
    storage: jsonStorage,
    utils: storageUtils,
    stats: () => storageUtils.printStats(),
    search: (q: string) => storageUtils.globalSearch(q),
    backup: () => storageUtils.createBackup(),
    validate: () => storageUtils.validateData(),
    storageInfo: () => storageUtils.getStorageInfo()
  };
}
