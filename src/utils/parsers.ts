export interface ParsedFunction {
  name: string;
  type: 'Sub' | 'Function';
  line: number;
}

export interface ParsedQuery {
  query: string;
  type: string;
  line: number;
}

export interface ParsedError {
  pattern: string;
  line: number;
  root_cause: string;
  category: string;
}

export interface DocumentMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  filename: string;
}

export interface SOPStep {
  step_number: number;
  title: string;
  description: string;
  duration?: string;
}

export interface DiagramInfo {
  type: string;
  description: string;
  elements: number;
}

// ===== DOCUMENT PARSER =====
export function parseDocument(content: string, filename: string) {
  const firstLine = content.split('\n')[0] || '';
  const title = firstLine.replace(/[#*_]/g, '').trim() || filename.split('.')[0];
  
  // Extract categories from content
  const categoryMatch = content.match(/category:\s*([^\n]+)/i);
  const category = categoryMatch?.[1]?.trim() || 'General Documentation';
  
  // Extract tags
  const tagsMatch = content.match(/tags:\s*([^\n]+)/i);
  const tags = tagsMatch?.[1]?.split(',').map(t => t.trim()).filter(Boolean) || ['document', 'documentation'];
  
  // Get description (first paragraph)
  const descriptionMatch = content.match(/(?:description|summary):\s*([^\n]+)/i);
  const description = descriptionMatch?.[1]?.trim() || 'Imported document';

  return {
    title,
    description,
    category,
    tags,
    filename,
    content,
    content_length: content.length,
    line_count: content.split('\n').length
  };
}

// ===== SOP PARSER =====
export function parseSOPDocument(content: string, filename: string) {
  const lines = content.split('\n');
  const steps: SOPStep[] = [];
  
  // Extract title from first non-empty line
  const titleLine = lines.find(l => l.trim().length > 0) || filename;
  const title = titleLine.replace(/^#+\s*/, '').trim();
  
  // Extract SOP steps
  let currentStep = 0;
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Match step patterns: "Step 1:", "1.", "- Step", etc.
    const stepMatch = trimmed.match(/^(?:step\s*)?(\d+)[\.:]/i);
    if (stepMatch) {
      currentStep = parseInt(stepMatch[1]);
      const stepText = trimmed.substring(stepMatch[0].length).trim();
      steps.push({
        step_number: currentStep,
        title: stepText.split('\n')[0] || `Step ${currentStep}`,
        description: stepText,
        duration: ''
      });
    }
  });

  const category = 'Standard Operating Procedure';
  const tags = ['sop', 'procedure', 'process', 'guide'];
  
  return {
    title: title || 'Untitled SOP',
    category,
    tags,
    filename,
    steps: steps.length > 0 ? steps : [{ step_number: 1, title: 'Process', description: content, duration: '' }],
    total_steps: steps.length,
    estimated_time: `${steps.length * 5} minutes`,
    content
  };
}

// ===== DIAGRAM PARSER =====
export function parseDiagramFile(content: string, filename: string) {
  const type = filename.split('.').pop()?.toLowerCase() || 'unknown';
  
  let elements = 0;
  let description = '';
  
  // Count diagram elements based on file type
  if (type === 'puml' || type === 'plantuml') {
    elements = (content.match(/@startuml|@enduml|actor|usecase|class|object|interface/gi) || []).length;
    description = 'PlantUML Diagram';
  } else if (type === 'mmd' || type === 'mermaid') {
    elements = (content.match(/graph|diagram|flowchart|sequenceDiagram|classDiagram/gi) || []).length;
    description = 'Mermaid Diagram';
  } else if (type === 'svg' || type === 'xml') {
    elements = (content.match(/<g>|<path|<rect|<circle|<text/gi) || []).length;
    description = `${type.toUpperCase()} Diagram`;
  } else if (type === 'drawio' || type === 'xml') {
    elements = (content.match(/<mxCell|<mxGeometry/gi) || []).length;
    description = 'Draw.io Diagram';
  }

  return {
    title: filename.split('.')[0],
    type,
    description,
    filename,
    elements,
    content,
    file_size: content.length,
    tags: ['diagram', type, 'visual']
  };
}

// ===== IMAGE METADATA PARSER =====
export function parseImageMetadata(filename: string, file: File) {
  const type = filename.split('.').pop()?.toLowerCase() || 'image';
  
  return {
    title: filename.split('.')[0],
    filename,
    file_type: type,
    file_size: file.size,
    category: 'Image/Screenshot',
    tags: ['image', 'screenshot', 'visual', type],
    mime_type: file.type,
    description: `Image file: ${filename}`,
    uploaded_at: new Date().toISOString()
  };
}

// ===== PDF TEXT EXTRACTOR =====
export function parsePDFText(content: string, filename: string) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const title = lines[0]?.substring(0, 100) || filename.split('.')[0];
  
  // Try to extract structured content
  const sections = [];
  let currentSection = { title: 'Content', content: '' };
  
  lines.forEach(line => {
    // Detect section headers (all caps or numbered)
    if (line.match(/^[A-Z\s]{5,}$/) || line.match(/^\d+\.\s+/)) {
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      currentSection = { title: line.trim(), content: '' };
    } else {
      currentSection.content += line + '\n';
    }
  });
  
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return {
    title,
    filename,
    category: 'PDF Document',
    tags: ['pdf', 'document', 'reference'],
    sections: sections.slice(0, 10),
    total_pages: Math.ceil(lines.length / 25),
    content_preview: lines.slice(0, 5).join('\n'),
    content
  };
}

// ===== VIDEO/AUDIO METADATA =====
export function parseMediaMetadata(filename: string, file: File) {
  const type = filename.split('.').pop()?.toLowerCase() || 'media';
  const isAudio = ['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(type);
  const isVideo = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(type);
  
  return {
    title: filename.split('.')[0],
    filename,
    file_type: type,
    media_type: isVideo ? 'video' : isAudio ? 'audio' : 'media',
    category: isVideo ? 'Video Tutorial/Documentation' : isAudio ? 'Audio Documentation' : 'Media File',
    file_size: file.size,
    file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
    mime_type: file.type,
    tags: [isVideo ? 'video' : 'audio', 'media', type],
    description: `${isVideo ? 'Video' : isAudio ? 'Audio' : 'Media'} file: ${filename}`,
    duration: 'N/A (requires processing)',
    uploaded_at: new Date().toISOString()
  };
}

// ===== SPREADSHEET PARSER =====
export function parseSpreadsheetMetadata(filename: string) {
  return {
    title: filename.split('.')[0],
    filename,
    file_type: filename.split('.').pop()?.toLowerCase(),
    category: 'Spreadsheet/Data',
    tags: ['spreadsheet', 'data', 'analysis'],
    description: `Spreadsheet file: ${filename}`,
    note: 'Import CSV or convert to .txt for content analysis',
    content_preview: 'Binary file - not readable as text'
  };
}

// ===== ARCHIVE PARSER =====
export function parseArchiveMetadata(filename: string, file: File) {
  return {
    title: filename.split('.')[0],
    filename,
    file_type: filename.split('.').pop()?.toLowerCase(),
    file_size: file.size,
    file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
    category: 'Archive/Compressed',
    tags: ['archive', 'compressed', 'backup'],
    description: `Archived file: ${filename}`,
    note: 'Extract contents to import individual files',
    uploaded_at: new Date().toISOString()
  };
}

// ===== CODE FILE PARSER =====
export function parseCodeFile(content: string, filename: string) {
  const type = filename.split('.').pop()?.toLowerCase() || 'txt';
  
  const lines = content.split('\n');
  const functionCount = (content.match(/function|def|sub|procedure|method/gi) || []).length;
  const commentLines = lines.filter(l => l.trim().match(/^[#/*]|\/\/|'|\-\-/)).length;
  const codeLines = lines.length - commentLines;
  
  return {
    title: filename,
    filename,
    language: type,
    category: 'Source Code',
    tags: ['code', type, 'programming'],
    description: `${type.toUpperCase()} source code file`,
    statistics: {
      total_lines: lines.length,
      code_lines: codeLines,
      comment_lines: commentLines,
      functions: functionCount
    },
    file_size: content.length,
    content
  };
}

export function parseVBCode(content: string) {
  const lines = content.split('\n');
  const functions: ParsedFunction[] = [];
  const queries: ParsedQuery[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    const subMatch = trimmed.match(/^(Public|Private|Protected)?\s*(Sub|Function)\s+(\w+)/i);
    if (subMatch) {
      functions.push({
        name: subMatch[3],
        type: subMatch[2] as 'Sub' | 'Function',
        line: index + 1
      });
    }

    const sqlMatch = trimmed.match(/(SELECT|INSERT|UPDATE|DELETE|EXEC)\s+/i);
    if (sqlMatch) {
      const queryEnd = line.indexOf('"', line.indexOf(sqlMatch[1]) + sqlMatch[1].length + 10);
      const queryText = queryEnd > 0 ? line.substring(line.indexOf(sqlMatch[1]), queryEnd) : line;
      queries.push({
        query: queryText.trim(),
        type: sqlMatch[1].toUpperCase(),
        line: index + 1
      });
    }
  });

  const summary = `Module contains ${functions.length} functions/subs and ${queries.length} SQL operations.`;

  return { functions, queries, summary };
}

export function parseSQLFile(content: string) {
  const queries: ParsedQuery[] = [];
  const lines = content.split('\n');

  let currentQuery = '';
  let queryStartLine = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i)) {
      if (currentQuery) {
        const type = currentQuery.match(/^(\w+)/)?.[1].toUpperCase() || 'UNKNOWN';
        queries.push({
          query: currentQuery.trim(),
          type,
          line: queryStartLine
        });
      }
      currentQuery = line;
      queryStartLine = index + 1;
    } else if (currentQuery && trimmed) {
      currentQuery += '\n' + line;
    }

    if (trimmed.endsWith(';')) {
      const type = currentQuery.match(/^(\w+)/)?.[1].toUpperCase() || 'UNKNOWN';
      queries.push({
        query: currentQuery.trim(),
        type,
        line: queryStartLine
      });
      currentQuery = '';
    }
  });

  const summary = `SQL file contains ${queries.length} queries.`;
  return { queries, summary };
}

export function parseLogFile(content: string) {
  const lines = content.split('\n');
  const errors: ParsedError[] = [];

  const errorPatterns = [
    { pattern: /price.*mismatch|harga.*tidak.*sesuai/i, category: 'price_mismatch', root_cause: 'Price synchronization issue between systems' },
    { pattern: /bkp.*missing|bkp.*tidak.*ditemukan/i, category: 'bkp_missing', root_cause: 'BKP record not found in database' },
    { pattern: /plu.*not.*found|plu.*tidak.*ditemukan/i, category: 'plu_not_found', root_cause: 'PLU code missing or not synchronized' },
    { pattern: /ppn.*error|ppn.*salah/i, category: 'ppn_error', root_cause: 'Tax calculation error or missing configuration' },
    { pattern: /gudang.*mismatch|warehouse.*error/i, category: 'gudang_mismatch', root_cause: 'Warehouse data inconsistency' },
    { pattern: /error|exception|failed/i, category: 'general_error', root_cause: 'General system error' }
  ];

  lines.forEach((line, index) => {
    for (const pattern of errorPatterns) {
      if (pattern.pattern.test(line)) {
        errors.push({
          pattern: line.trim(),
          line: index + 1,
          root_cause: pattern.root_cause,
          category: pattern.category
        });
        break;
      }
    }
  });

  const summary = `Log contains ${errors.length} error patterns detected.`;
  return { errors, summary };
}

export function generateFlowFromLog(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());

  let mermaid = 'sequenceDiagram\n';
  mermaid += '    participant User\n';
  mermaid += '    participant System\n';
  mermaid += '    participant Database\n\n';

  lines.slice(0, 10).forEach((line) => {
    if (line.match(/start|begin|init/i)) {
      mermaid += `    User->>System: ${line.substring(0, 40)}\n`;
    } else if (line.match(/select|query|fetch/i)) {
      mermaid += `    System->>Database: ${line.substring(0, 40)}\n`;
      mermaid += `    Database-->>System: Return data\n`;
    } else if (line.match(/error|exception|fail/i)) {
      mermaid += `    System->>System: Error: ${line.substring(0, 30)}\n`;
    } else if (line.match(/response|return|complete/i)) {
      mermaid += `    System-->>User: ${line.substring(0, 40)}\n`;
    }
  });

  return mermaid;
}
