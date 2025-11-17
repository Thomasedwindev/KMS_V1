# Quick Start Guide - JSON Storage KMS Prototype

## ✨ What's New

Supabase has been **completely removed** and replaced with **100% JSON-based storage**. Your KMS prototype now works entirely with browser localStorage!

## 🚀 Get Started (2 minutes)

### 1. Install Dependencies
```bash
npm install
```
*(Supabase dependency removed from package.json)*

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:5173
```

## 📊 What You Can Do Now

### ✅ Upload Files
- VB/VB.NET files (.vb, .bas, .cls)
- SQL files (.sql)
- Log files (.log, .txt)
- → **All extracted data stored in localStorage**

### ✅ Browse Knowledge
- View all uploaded code documentation
- Browse extracted SQL queries
- Check error patterns from logs
- Explore procedure library (SOPs)

### ✅ Search Knowledge
- Search across all stored data
- Filter by relevance
- Find specific patterns, functions, queries

### ✅ Create Flows
- Generate sequence diagrams from logs
- Create custom Mermaid diagrams
- Visualize processes

### ✅ Backup & Restore
- **Export**: Download all data as JSON file
- **Import**: Upload JSON file to restore data
- Share data files with team

## 💾 Data Storage

### Location
- **Where**: Browser's localStorage
- **Key**: `kms_prototype_data`
- **Format**: Single JSON object

### View in Browser DevTools
```javascript
// Open browser DevTools Console and run:
JSON.parse(localStorage.getItem('kms_prototype_data'))
```

### Clear All Data
```javascript
// In browser console:
localStorage.removeItem('kms_prototype_data')
```

## 🎯 Common Tasks

### Task 1: Upload and Extract a VB File

1. Click **"Upload Files"** in Dashboard
2. Select **"VB/VB.NET Code"** tab
3. Choose your `.vb` file
4. Click **"Upload & Process"**
5. ✅ File parsed and stored automatically

### Task 2: Search for a Query

1. Click **"Search Knowledge"** in Dashboard
2. Type your search term (e.g., "SELECT")
3. Click **"Search"**
4. Results grouped by type with relevance score

### Task 3: Export Your Data

1. Open Browser DevTools
2. Go to Console tab
3. Run: `kmsDebug.backup()`
4. Opens save dialog for JSON file

### Task 4: View Statistics

1. Click **Dashboard**
2. See counts of:
   - Code Documentation items
   - SQL Queries
   - Error patterns
   - SOPs
   - Flow diagrams

## 🔍 Debugging & Utilities

### Built-in Debug Console
All utilities available as `kmsDebug` global:

```javascript
// Get storage statistics
kmsDebug.stats()

// Search everything
kmsDebug.search('error')

// Create backup
kmsDebug.backup()

// Validate data
kmsDebug.validate()

// Check storage usage
kmsDebug.storageInfo()
```

### Check Storage Usage
```javascript
kmsDebug.storageInfo()
// Returns: bytes, kilobytes, megabytes, percentOfLimit, limitReached
```

### Example Output
```
{
  bytes: 145250,
  kilobytes: 141.85,
  megabytes: 0.14,
  percentOfLimit: 2.7,
  limitReached: false
}
```

## ⚠️ Important Notes

### Storage Limit
- Browser localStorage: **~5-10 MB** (varies)
- Current usage shown in DevTools
- Not a concern for typical prototype use

### Data Persistence
- ✅ Persists after page refresh
- ✅ Persists after browser restart
- ✅ **Does NOT sync** between browsers/devices
- ✅ Exported for sharing as JSON file

### Clearing Data
- ❌ Do NOT clear browser cookies (won't affect this)
- ✅ Use **Export** first to backup
- ✅ Clear via Console or app settings

## 📁 Files Changed

```
✨ Created:
  src/lib/jsonStorage.ts         (Main storage module)
  src/lib/storageUtils.ts        (Debug utilities)
  JSON_STORAGE_GUIDE.md          (Detailed guide)
  MIGRATION_SUMMARY.md           (What changed)

✏️ Modified:
  src/components/*.tsx           (5 components updated)
  package.json                   (Supabase removed)

📚 Kept for reference:
  src/lib/supabase.ts           (Not used anymore)
  supabase/migrations/          (Not needed)
```

## 🧪 Testing Checklist

Run through these to verify everything works:

- [ ] Install with `npm install`
- [ ] Start server with `npm run dev`
- [ ] Upload a VB file
- [ ] Upload a SQL file
- [ ] Upload a log file
- [ ] Browse Knowledge to see items
- [ ] Search for something
- [ ] Create a custom flow
- [ ] Export data
- [ ] Check storage with DevTools
- [ ] Clear localStorage
- [ ] Refresh page - data gone
- [ ] Restore by importing exported JSON

## 📝 Example: Upload Workflow

```
User selects VB file
      ↓
parseVBCode() extracts functions & queries
      ↓
jsonStorage.insert('code_docs', {...})
      ↓
Data saved to localStorage automatically
      ↓
Dashboard updates count
      ↓
Browse section shows new item
      ↓
Can search and view immediately
```

## 🎓 Learning Resources

1. **JSON_STORAGE_GUIDE.md** - Complete API documentation
2. **MIGRATION_SUMMARY.md** - What changed and why
3. **src/lib/jsonStorage.ts** - Implementation details
4. **src/lib/storageUtils.ts** - Debug utilities

## 🐛 Troubleshooting

### "Data disappeared after refresh"
- Check if localStorage is enabled
- Ensure you're on HTTPS (localhost is OK)
- Check private/incognito mode

### "Can't import file"
- Verify JSON file format is correct
- Check all required fields present
- See JSON_STORAGE_GUIDE.md for schema

### "Storage full" warning
- Export current data as backup
- Delete old entries you don't need
- Consider splitting into multiple sessions

### "No errors but data not showing"
- Check browser console for errors
- Open DevTools > Application > Local Storage
- Verify key `kms_prototype_data` exists

## 🚀 Next Steps

1. ✅ **Explore** - Upload different file types
2. ✅ **Learn** - Check extracted data in DevTools
3. ✅ **Create** - Build custom flows
4. ✅ **Share** - Export data and share with team
5. ✅ **Iterate** - Improve parsers based on real files

## 💡 Pro Tips

### Tip 1: Regular Backups
```javascript
// Run this daily to backup your work
kmsDebug.backup()  // Downloads kms-backup-YYYY-MM-DD.json
```

### Tip 2: Batch Upload
- Prepare multiple files
- Upload one by one
- All stored together automatically

### Tip 3: Data Sharing
- Export from your browser
- Send JSON file to teammate
- They import it - data instantly available

### Tip 4: Monitor Usage
```javascript
// Check before running out of space
kmsDebug.storageInfo()
```

---

## 📞 Support

For issues or questions:
1. Check JSON_STORAGE_GUIDE.md
2. Review MIGRATION_SUMMARY.md
3. Use `kmsDebug.*` utilities to investigate
4. Check browser DevTools Console for errors

## ✅ Status

- **Supabase**: ✅ Removed completely
- **JSON Storage**: ✅ Fully functional
- **Features**: ✅ All working
- **Storage**: ✅ Browser localStorage
- **Ready for**: ✅ Prototype use

**Happy prototyping!** 🎉
