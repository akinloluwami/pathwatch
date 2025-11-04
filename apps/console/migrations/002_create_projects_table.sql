-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "org_id" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "api_key" text NOT NULL UNIQUE,
  "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE("org_id", "slug")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "projects_org_id_idx" ON "projects" ("org_id");
CREATE INDEX IF NOT EXISTS "projects_api_key_idx" ON "projects" ("api_key");
