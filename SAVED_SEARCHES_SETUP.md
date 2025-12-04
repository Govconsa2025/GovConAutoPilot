# Saved Searches Database Setup

## Table: saved_searches

Run this SQL in your Supabase SQL Editor:

```sql
-- Create saved_searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  organization_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view saved searches in their organization"
  ON saved_searches FOR SELECT
  USING (organization_id = current_setting('app.current_organization', true));

CREATE POLICY "Users can create saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization', true));

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (user_id = auth.uid());

-- Create index
CREATE INDEX idx_saved_searches_org ON saved_searches(organization_id);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
```

## Features

The saved_searches table stores:
- Custom search filter configurations
- Multi-select tag filters
- Date range filters
- File type filters
- File size range filters

Users can save frequently used filter combinations and load them with one click.
