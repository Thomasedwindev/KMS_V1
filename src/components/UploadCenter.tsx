import { useState } from 'react';
import { Upload, FileCode, Database as DatabaseIcon, FileText, CheckCircle, BookOpen, Zap, Video, BarChart3, Archive } from 'lucide-react';
import { jsonStorage } from '../lib/jsonStorage';
import { 
  parseVBCode, parseSQLFile, parseLogFile, generateFlowFromLog, parseDocument, 
  parseSOPDocument, parseDiagramFile, parseImageMetadata, parsePDFText, parseMediaMetadata, 
  parseSpreadsheetMetadata, parseArchiveMetadata
} from '../utils/parsers';

export default function UploadCenter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'code' | 'sql' | 'log' | 'doc' | 'sop' | 'diagram' | 'image' | 'pdf' | 'media' | 'spreadsheet' | 'archive' | 'other'>('code');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSuccess(false);
      setPreview('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setSuccess(false);

    try {
      const content = await selectedFile.text();
      const filename = selectedFile.name;

      if (fileType === 'code') {
        const { functions, queries, summary } = parseVBCode(content);
        await jsonStorage.insert('code_docs', {
          filename, content, functions, queries, summary
        });
        for (const query of queries) {
          await jsonStorage.insert('query_library', {
            query_text: query.query,
            category: query.type.toLowerCase(),
            source_file: filename
          });
        }
        setPreview(`✅ Extracted: ${functions.length} functions, ${queries.length} SQL queries`);
      } else if (fileType === 'sql') {
        const { queries } = parseSQLFile(content);
        for (const query of queries) {
          await jsonStorage.insert('query_library', {
            query_text: query.query,
            category: query.type.toLowerCase(),
            source_file: filename,
            example_usage: `Line ${query.line} from ${filename}`
          });
        }
        setPreview(`✅ Extracted: ${queries.length} SQL queries`);
      } else if (fileType === 'log') {
        const { errors } = parseLogFile(content);
        await jsonStorage.insert('error_logs', {
          filename, content, errors,
          summary: `Detected ${errors.length} error patterns`
        });
        const mermaidFlow = generateFlowFromLog(content);
        await jsonStorage.insert('flows', {
          title: `Flow from ${filename}`,
          source: filename,
          mermaid_text: mermaidFlow
        });
        setPreview(`✅ Detected: ${errors.length} error patterns, 1 flow generated`);
      } else if (fileType === 'doc') {
        const docData = parseDocument(content, filename);
        await jsonStorage.insert('documents', docData);
        setPreview(`✅ Document stored: "${docData.title}" | Category: ${docData.category}`);
      } else if (fileType === 'sop') {
        const sopData = parseSOPDocument(content, filename);
        await jsonStorage.insert('sop_library', sopData);
        setPreview(`✅ SOP stored: "${sopData.title}" | ${sopData.total_steps} steps`);
      } else if (fileType === 'diagram') {
        const diagramData = parseDiagramFile(content, filename);
        await jsonStorage.insert('diagrams', diagramData);
        setPreview(`✅ Diagram stored: "${diagramData.title}" | Type: ${diagramData.type} | ${diagramData.elements} elements`);
      } else if (fileType === 'pdf') {
        const pdfData = parsePDFText(content, filename);
        await jsonStorage.insert('documents', {
          filename,
          title: pdfData.title,
          category: pdfData.category,
          tags: pdfData.tags,
          content: pdfData.content,
          sections: pdfData.sections,
          total_pages: pdfData.total_pages
        });
        setPreview(`✅ PDF imported: "${pdfData.title}" | ${pdfData.total_pages} pages | ${pdfData.sections.length} sections`);
      } else if (fileType === 'image') {
        const imageData = parseImageMetadata(filename, selectedFile);
        await jsonStorage.insert('images', imageData);
        setPreview(`✅ Image stored: ${filename} | Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      } else if (fileType === 'media') {
        const mediaData = parseMediaMetadata(filename, selectedFile);
        await jsonStorage.insert('media', mediaData);
        setPreview(`✅ Media file stored: ${filename} | Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      } else if (fileType === 'spreadsheet') {
        const spreadsheetData = parseSpreadsheetMetadata(filename);
        await jsonStorage.insert('spreadsheets', spreadsheetData);
        setPreview(`✅ Spreadsheet stored: ${filename} | Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      } else if (fileType === 'archive') {
        const archiveData = parseArchiveMetadata(filename, selectedFile);
        await jsonStorage.insert('archives', archiveData);
        setPreview(`✅ Archive stored: ${filename} | Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
      } else {
        // Generic file storage for other types
        const metadata = {
          filename,
          file_type: filename.split('.').pop()?.toLowerCase(),
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          category: 'Other Files',
          tags: ['other'],
          uploaded_at: new Date().toISOString(),
          content: content.substring(0, 1000)
        };
        
        await jsonStorage.insert('other_files', metadata);
        setPreview(`✅ File stored: ${filename}`);
      }

      setSuccess(true);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Upload Center</h1>
        <p className="text-gray-600 mt-2">Upload any file type: code, documents, diagrams, images, media, and more</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select File Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 'code', label: 'VB Code', icon: FileCode, color: 'blue', ext: '.vb,.bas,.cls' },
                { id: 'sql', label: 'SQL', icon: DatabaseIcon, color: 'green', ext: '.sql' },
                { id: 'log', label: 'Logs', icon: FileText, color: 'red', ext: '.log,.txt' },
                { id: 'doc', label: 'Documents', icon: FileText, color: 'purple', ext: '.doc,.docx,.txt,.md' },
                { id: 'sop', label: 'SOPs', icon: BookOpen, color: 'orange', ext: '.txt,.md,.doc' },
                { id: 'diagram', label: 'Diagrams', icon: Zap, color: 'cyan', ext: '.mmd,.puml,.drawio,.svg' },
                { id: 'pdf', label: 'PDF', icon: FileText, color: 'indigo', ext: '.pdf' },
                { id: 'image', label: 'Images', icon: 'Image', color: 'pink', ext: '.jpg,.png,.gif,.bmp' },
                { id: 'media', label: 'Media', icon: Video, color: 'rose', ext: '.mp4,.mp3,.avi' },
                { id: 'spreadsheet', label: 'Spreadsheet', icon: BarChart3, color: 'emerald', ext: '.csv,.xlsx' },
                { id: 'archive', label: 'Archive', icon: Archive, color: 'slate', ext: '.zip,.rar,.7z' },
                { id: 'other', label: 'Other', icon: Upload, color: 'gray', ext: 'any file' }
              ].map((ft: any) => {
                const isSelected = fileType === ft.id;
                const Icon = typeof ft.icon === 'string' ? null : ft.icon;
                const bgColor = isSelected ? `bg-${ft.color}-50 border-${ft.color}-600` : 'bg-white border-gray-200 hover:border-gray-300';
                const textColor = isSelected ? `text-${ft.color}-600` : 'text-gray-600';
                
                return (
                  <button
                    key={ft.id}
                    onClick={() => setFileType(ft.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${bgColor}`}
                  >
                    {Icon && <Icon className={`w-5 h-5 mx-auto mb-1 ${textColor}`} />}
                    <div className={`text-xs font-semibold ${textColor}`}>{ft.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-semibold">
                  Choose a file
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept={
                    fileType === 'code' ? '.vb,.bas,.cls,.txt' :
                    fileType === 'sql' ? '.sql' :
                    fileType === 'log' ? '.log,.txt' :
                    fileType === 'doc' ? '.doc,.docx,.txt,.md,.rtf' :
                    fileType === 'sop' ? '.txt,.md,.doc,.docx' :
                    fileType === 'diagram' ? '.mmd,.puml,.drawio,.svg,.xml' :
                    fileType === 'pdf' ? '.pdf' :
                    fileType === 'image' ? '.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg' :
                    fileType === 'media' ? '.mp4,.avi,.mov,.mkv,.flv,.mp3,.wav,.aac,.m4a' :
                    fileType === 'spreadsheet' ? '.csv,.xlsx,.xls,.ods' :
                    fileType === 'archive' ? '.zip,.rar,.7z,.tar,.gz' :
                    ''
                  }
                />
              </label>
              {selectedFile && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: <span className="font-semibold">{selectedFile.name}</span>
                  <div className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                </div>
              )}
            </div>
          </div>

          {preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">Upload Result:</div>
              <div className="text-sm text-blue-800">{preview}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-semibold">File processed and stored successfully!</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || processing}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedFile && !processing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {processing ? 'Processing...' : 'Upload & Process'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Supported Formats</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Code:</strong> .vb, .bas, .cls, source files</li>
            <li>• <strong>SQL:</strong> .sql query files</li>
            <li>• <strong>Documents:</strong> .doc, .docx, .txt, .md</li>
            <li>• <strong>SOPs:</strong> .txt, .md, .doc (procedures)</li>
            <li>• <strong>Diagrams:</strong> .mmd, .puml, .drawio, .svg</li>
            <li>• <strong>PDF:</strong> .pdf documents</li>
            <li>• <strong>Images:</strong> .jpg, .png, .gif, .bmp, .webp</li>
            <li>• <strong>Media:</strong> .mp4, .mp3, .avi, .mov</li>
            <li>• <strong>Spreadsheets:</strong> .csv, .xlsx, .xls</li>
            <li>• <strong>Archives:</strong> .zip, .rar, .7z</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">✨ What Happens</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>✓ File is analyzed and extracted</li>
            <li>✓ Content is organized by type</li>
            <li>✓ Metadata and tags are auto-generated</li>
            <li>✓ Data stored in browser locally</li>
            <li>✓ Searchable through Knowledge Browser</li>
            <li>✓ Can be exported as JSON</li>
            <li>✓ Available for flows and diagrams</li>
            <li>✓ Shareable with team via export</li>
            <li>✓ No size limits (5-10 MB per file)</li>
            <li>✓ Instant processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
