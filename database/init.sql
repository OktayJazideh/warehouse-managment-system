-- PostgreSQL Database Initialization Script for Warehouse Management System
-- This script will be executed when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (will be created by Sequelize migrations)
-- This script is just for initial setup

-- Set timezone
SET timezone = 'UTC';

-- Create custom functions for audit logging (optional)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Log initialization
INSERT INTO pg_stat_statements_reset();

-- Database is ready
SELECT 'Database initialized successfully' AS status;