import { useState } from 'react';
import { Upload, FileCode, Database as DatabaseIcon, FileText, CheckCircle } from 'lucide-react';
import { jsonStorage } from '../lib/jsonStorage';
import { parseVBCode, parseSQLFile, parseLogFile, generateFlowFromLog } from '../utils/parsers';

export default function UploadCenter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'code' | 'sql' | 'log'>('code');
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

      if (fileType === 'code') {
        const { functions, queries, summary } = parseVBCode(content);

        await jsonStorage.insert('code_docs', {
          filename: selectedFile.name,
          content,
          functions,
          queries,
          summary
        });

        for (const query of queries) {
          await jsonStorage.insert('query_library', {
            query_text: query.query,
            category: query.type.toLowerCase(),
            source_file: selectedFile.name
          });
        }

        setPreview(`Extracted: ${functions.length} functions, ${queries.length} SQL queries`);
      } else if (fileType === 'sql') {
        const { queries, summary } = parseSQLFile(content);

        for (const query of queries) {
          await jsonStorage.insert('query_library', {
            query_text: query.query,
            category: query.type.toLowerCase(),
            source_file: selectedFile.name,
            example_usage: `Line ${query.line} from ${selectedFile.name}`
          });
        }

        setPreview(`Extracted: ${queries.length} SQL queries`);
      } else if (fileType === 'log') {
        const { errors, summary } = parseLogFile(content);

        await jsonStorage.insert('error_logs', {
          filename: selectedFile.name,
          content,
          errors,
          summary
        });

        const mermaidFlow = generateFlowFromLog(content);
        await jsonStorage.insert('flows', {
          title: `Flow from ${selectedFile.name}`,
          source: selectedFile.name,
          mermaid_text: mermaidFlow
        });

        setPreview(`Detected: ${errors.length} error patterns`);
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
        <p className="text-gray-600 mt-2">Upload code, SQL, or log files for automatic parsing</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">File Type</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setFileType('code')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  fileType === 'code'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileCode className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold">VB/VB.NET Code</div>
                <div className="text-xs text-gray-600 mt-1">.vb, .bas, .cls</div>
              </button>

              <button
                onClick={() => setFileType('sql')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  fileType === 'sql'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DatabaseIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="font-semibold">SQL File</div>
                <div className="text-xs text-gray-600 mt-1">.sql</div>
              </button>

              <button
                onClick={() => setFileType('log')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  fileType === 'log'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="font-semibold">Log File</div>
                <div className="text-xs text-gray-600 mt-1">.log, .txt</div>
              </button>
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
                    fileType === 'code'
                      ? '.vb,.bas,.cls,.txt'
                      : fileType === 'sql'
                      ? '.sql'
                      : '.log,.txt'
                  }
                />
              </label>
              {selectedFile && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: <span className="font-semibold">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          {preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">Extraction Preview:</div>
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
    </div>
  );
}
