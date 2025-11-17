// JSON-based storage for prototype - stores data in localStorage
interface StorageData {
  code_docs: any[];
  query_library: any[];
  error_logs: any[];
  sop_library: any[];
  flows: any[];
  documents: any[];
  diagrams: any[];
  source_code: any[];
  images: any[];
  media: any[];
  spreadsheets: any[];
  archives: any[];
  other_files: any[];
}

const STORAGE_KEY = 'kms_prototype_data';

const defaultData: StorageData = {
  code_docs: [],
  query_library: [],
  error_logs: [],
  sop_library: [],
  flows: [],
  documents: [],
  diagrams: [],
  source_code: [],
  images: [],
  media: [],
  spreadsheets: [],
  archives: [],
  other_files: []
};

function getStorageData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultData;
  } catch {
    console.warn('Failed to read from localStorage, using default data');
    return defaultData;
  }
}

function saveStorageData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const jsonStorage = {
  // Generic select method to fetch from tables
  async select(table: keyof StorageData) {
    const data = getStorageData();
    return {
      data: data[table] || [],
      error: null,
      count: (data[table] || []).length
    };
  },

  // Insert data into table
  async insert(table: keyof StorageData, record: any) {
    const data = getStorageData();
    const newRecord = {
      ...record,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    
    if (!data[table]) {
      data[table] = [];
    }
    
    data[table].push(newRecord);
    saveStorageData(data);
    
    return {
      data: newRecord,
      error: null
    };
  },

  // Update data in table
  async update(table: keyof StorageData, id: string, updates: any) {
    const data = getStorageData();
    const items = data[table] || [];
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      return { data: null, error: 'Record not found' };
    }
    
    items[index] = { ...items[index], ...updates };
    saveStorageData(data);
    
    return { data: items[index], error: null };
  },

  // Delete data from table
  async delete(table: keyof StorageData, id: string) {
    const data = getStorageData();
    const items = data[table] || [];
    const filtered = items.filter((item: any) => item.id !== id);
    
    if (items.length === filtered.length) {
      return { data: null, error: 'Record not found' };
    }
    
    data[table] = filtered;
    saveStorageData(data);
    
    return { data: null, error: null };
  },

  // Query with filtering
  async query(table: keyof StorageData, filter?: (item: any) => boolean) {
    const data = getStorageData();
    let items = data[table] || [];
    
    if (filter) {
      items = items.filter(filter);
    }
    
    return {
      data: items,
      error: null,
      count: items.length
    };
  },

  // Export data as JSON file
  exportData() {
    const data = getStorageData();
    const dataStr = JSON.stringify(data, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `kms-data-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  // Import data from JSON file
  async importData(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text) as StorageData;
      
      // Validate structure
      const requiredKeys: (keyof StorageData)[] = ['code_docs', 'query_library', 'error_logs', 'sop_library', 'flows'];
      const hasAllKeys = requiredKeys.every(key => key in importedData);
      
      if (!hasAllKeys) {
        return { success: false, error: 'Invalid data format' };
      }
      
      saveStorageData(importedData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to parse JSON file' };
    }
  },

  // Clear all data
  clearAll() {
    saveStorageData(defaultData);
  },

  // Get all data
  getAllData(): StorageData {
    return getStorageData();
  }
};
