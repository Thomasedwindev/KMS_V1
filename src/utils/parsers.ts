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

  lines.slice(0, 10).forEach((line, index) => {
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
