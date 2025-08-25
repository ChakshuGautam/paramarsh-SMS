-- Fix PostgreSQL permissions for paramarsh user
-- Run this with: psql -U postgres -d paramarsh_sms -f fix-postgres-permissions.sql

-- Grant database connection permissions
GRANT CONNECT ON DATABASE paramarsh_sms TO paramarsh;

-- Grant schema usage permissions
GRANT USAGE ON SCHEMA public TO paramarsh;

-- Grant table permissions for all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO paramarsh;

-- Grant sequence permissions for auto-increment fields
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO paramarsh;

-- Grant permissions for future tables (important for migrations)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO paramarsh;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO paramarsh;

-- Make paramarsh owner of the database (recommended for full control)
ALTER DATABASE paramarsh_sms OWNER TO paramarsh;

-- Verify permissions
\l paramarsh_sms
\dp