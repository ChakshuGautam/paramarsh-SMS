#!/bin/bash

# Remote PostgreSQL Setup Script for Paramarsh SMS
# Run this on your remote server

set -e

echo "🚀 Setting up PostgreSQL for Paramarsh SMS..."

# Update system packages
sudo apt update -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER paramarsh WITH PASSWORD 'paramarsh123';
CREATE DATABASE paramarsh_sms;
GRANT ALL PRIVILEGES ON DATABASE paramarsh_sms TO paramarsh;
ALTER USER paramarsh CREATEDB;
EOF

# Configure PostgreSQL for remote connections (if needed)
echo "Configuring PostgreSQL for remote access..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Add authentication rule for the paramarsh user
echo "host    paramarsh_sms    paramarsh    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql

# Test connection
echo "Testing database connection..."
PGPASSWORD=paramarsh123 psql -h localhost -U paramarsh -d paramarsh_sms -c "SELECT version();"

echo "✅ PostgreSQL setup complete!"
echo "Connection string: postgresql://paramarsh:paramarsh123@localhost:5432/paramarsh_sms"