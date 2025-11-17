# JSON Storage Prototype Guide

## Overview
This KMS prototype now uses **100% JSON file-based storage** via browser localStorage, eliminating all Supabase dependencies. Perfect for rapid prototyping and local development.

## What Changed

### Removed
- ❌ Supabase client (`@supabase/supabase-js` package)
- ❌ Environment variables for Supabase configuration
- ❌ All Supabase `.from().select().insert()` calls

### Added
- ✅ **New JSON Storage Module** (`src/lib/jsonStorage.ts`)
- ✅ All data stored in browser's localStorage
- ✅ Export/Import functionality for JSON data
- ✅ Zero external database dependencies

## Architecture

### Storage Layer
All data is stored in localStorage as a single JSON object:

```typescript
{
  code_docs: [],
  query_library: [],
  error_logs: [],
  sop_library: [],
  flows: []
}
```

### Key Storage Functions

#### 1. Insert Data
```typescript
await jsonStorage.insert('code_docs', {
  filename: 'myfile.vb',
  content: '...',
  functions: [...],
  queries: [...],
  summary: '...'
});
```

#### 2. Select/Query Data
```typescript
const { data, count } = await jsonStorage.select('code_docs');
```

#### 3. Export Data (Download)
```typescript
jsonStorage.exportData(); // Downloads current data as JSON file
```

#### 4. Import Data (Upload)
```typescript
await jsonStorage.importData(file); // Uploads JSON file to localStorage
```

#### 5. Get All Data
```typescript
const allData = jsonStorage.getAllData();
```

#### 6. Clear Everything
```typescript
jsonStorage.clearAll();
```

## Updated Components

All components updated to use `jsonStorage` instead of `supabase`:

| Component | Changes |
|-----------|---------|
| **UploadCenter** | Stores parsed files in localStorage |
| **KnowledgeBrowser** | Retrieves data from localStorage |
| **SearchCenter** | Searches against localStorage data |
| **Dashboard** | Displays stats from localStorage counts |
| **FlowViewer** | Saves/loads flows from localStorage |

## Data Persistence

### Browser Storage
- **Type**: localStorage API (built-in, no setup needed)
- **Limit**: ~5-10 MB per origin (browser dependent)
- **Lifetime**: Persists until manually cleared
- **Scope**: Per-domain (localhost, different sites isolated)

### Export/Import JSON
Data can be exported as a `.json` file for:
- ✅ Backup purposes
- ✅ Sharing between team members
- ✅ Version control
- ✅ Moving to different browsers

## Usage Examples

### Upload and Store
```typescript
// User uploads a VB file
const content = await file.text();
const { functions, queries, summary } = parseVBCode(content);

await jsonStorage.insert('code_docs', {
  filename: file.name,
  content,
  functions,
  queries,
  summary
});
```

### Search Across All Data
```typescript
const allQueries = await jsonStorage.select('query_library');
const results = allQueries.data.filter(q => 
  q.query_text.includes(searchTerm)
);
```

### Backup & Restore
```typescript
// Export
jsonStorage.exportData(); // Downloads as kms-data-2025-01-17.json

// Import (after selecting file in UI)
const result = await jsonStorage.importData(selectedFile);
if (result.success) {
  console.log('Data imported successfully');
}
```

## Limitations & Considerations

| Aspect | Details |
|--------|---------|
| **Storage Limit** | ~5-10 MB (varies by browser) |
| **Multi-device sync** | Not supported (local only) |
| **Collaboration** | Export/Import for sharing |
| **Performance** | Best for <10,000 items |
| **Data Types** | JSON-serializable only |

## Performance Tips

1. **Large Files**: Keep individual stored items < 1 MB
2. **Search**: For large datasets, consider pagination
3. **Export Schedule**: Regular backups recommended
4. **Browser DevTools**: Check storage in Application > Local Storage

## Troubleshooting

### Data Not Persisting?
- Check if localStorage is enabled in browser
- Clear browser cache and try again
- Ensure you're using HTTPS (some browsers restrict HTTP)

### Import Failing?
- Verify JSON file format matches expected schema
- Check browser console for error messages
- Ensure all required fields are present

### Running Out of Space?
- Export and backup current data
- Clear old entries from localStorage
- Consider splitting data across files

## Browser DevTools

### View Stored Data
```javascript
// In browser console:
JSON.parse(localStorage.getItem('kms_prototype_data'))
```

### Clear All Data
```javascript
// In browser console:
localStorage.removeItem('kms_prototype_data')
```

## Migration from Supabase (Future)

When ready to move to production database:

1. Keep the `jsonStorage` interface same
2. Create `supabaseStorage` with identical API
3. Switch implementation via factory pattern
4. No component code changes needed!

## Next Steps

1. ✅ Run `npm install` (Supabase dependency removed)
2. ✅ Start dev server: `npm run dev`
3. ✅ Upload files through the UI
4. ✅ All data saved in localStorage automatically
5. ✅ Export data for backup anytime

## File Structure

```
src/
├── lib/
│   ├── supabase.ts        (kept for reference, not used)
│   └── jsonStorage.ts     (NEW - main storage module)
├── components/
│   ├── UploadCenter.tsx   (updated)
│   ├── KnowledgeBrowser.tsx (updated)
│   ├── SearchCenter.tsx   (updated)
│   ├── Dashboard.tsx      (updated)
│   └── FlowViewer.tsx     (updated)
```

---

**Status**: Production-ready for prototype use. All Supabase dependencies removed. 100% JSON-based storage via localStorage. ✨
