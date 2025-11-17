/*
  # Knowledge Management System SD7 - Database Schema

  1. New Tables
    - `code_docs`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `content` (text)
      - `functions` (jsonb) - extracted functions/subs
      - `queries` (jsonb) - extracted SQL queries
      - `summary` (text)
      - `created_at` (timestamptz)
    
    - `error_logs`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `content` (text)
      - `errors` (jsonb) - [{pattern, line, root_cause, category}]
      - `summary` (text)
      - `created_at` (timestamptz)
    
    - `query_library`
      - `id` (uuid, primary key)
      - `query_text` (text)
      - `category` (text)
      - `example_usage` (text)
      - `source_file` (text)
      - `created_at` (timestamptz)
    
    - `sop_library`
      - `id` (uuid, primary key)
      - `title` (text)
      - `category` (text)
      - `steps` (jsonb)
      - `related_errors` (jsonb)
      - `created_at` (timestamptz)
    
    - `flows`
      - `id` (uuid, primary key)
      - `title` (text)
      - `source` (text)
      - `mermaid_text` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (prototype mode)
    
  3. Important Notes
    - JSONB columns store structured extraction results
    - All tables track creation timestamp
    - Categories enable filtering and grouping
*/

CREATE TABLE IF NOT EXISTS code_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content text NOT NULL,
  functions jsonb DEFAULT '[]'::jsonb,
  queries jsonb DEFAULT '[]'::jsonb,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content text NOT NULL,
  errors jsonb DEFAULT '[]'::jsonb,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS query_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  category text DEFAULT 'general',
  example_usage text DEFAULT '',
  source_file text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sop_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text DEFAULT 'general',
  steps jsonb DEFAULT '[]'::jsonb,
  related_errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text DEFAULT '',
  mermaid_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on code_docs"
  ON code_docs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on code_docs"
  ON code_docs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read on error_logs"
  ON error_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on error_logs"
  ON error_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read on query_library"
  ON query_library FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on query_library"
  ON query_library FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read on sop_library"
  ON sop_library FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on sop_library"
  ON sop_library FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read on flows"
  ON flows FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on flows"
  ON flows FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_code_docs_filename ON code_docs(filename);
CREATE INDEX IF NOT EXISTS idx_error_logs_filename ON error_logs(filename);
CREATE INDEX IF NOT EXISTS idx_query_library_category ON query_library(category);
CREATE INDEX IF NOT EXISTS idx_sop_library_category ON sop_library(category);
CREATE INDEX IF NOT EXISTS idx_flows_title ON flows(title);
