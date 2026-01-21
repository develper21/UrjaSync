-- UrjaSync Database Setup Script
-- Run this script in pgAdmin or PostgreSQL console

-- Create database
CREATE DATABASE urjasync_db;

-- Create user
CREATE USER urjasync_user WITH PASSWORD 'UrjaSync@2024!Secure';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE urjasync_db TO urjasync_user;

-- Connect to the database
\c urjasync_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS urjasync;
SET search_path TO urjasync, public;

-- Users table
CREATE TABLE IF NOT EXISTS urjasync.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Devices table
CREATE TABLE IF NOT EXISTS urjasync.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    firmware_version VARCHAR(50),
    ip_address INET,
    mac_address MACADDR,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy data table
CREATE TABLE IF NOT EXISTS urjasync.energy_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES urjasync.devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    consumption_kwh DECIMAL(10,6) NOT NULL,
    voltage DECIMAL(8,2),
    current DECIMAL(8,2),
    power_watts DECIMAL(10,2),
    frequency DECIMAL(6,2),
    power_factor DECIMAL(5,4),
    temperature DECIMAL(6,2),
    humidity DECIMAL(6,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS urjasync.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    provider VARCHAR(255) NOT NULL,
    bill_number VARCHAR(100),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    units_consumed DECIMAL(10,2),
    rate_per_unit DECIMAL(8,4),
    fixed_charges DECIMAL(10,2),
    taxes DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    bill_file_url TEXT,
    is_manual BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS urjasync.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES urjasync.bills(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS urjasync.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'info',
    category VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_via JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon footprints table
CREATE TABLE IF NOT EXISTS urjasync.carbon_footprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_emissions DECIMAL(10,4) NOT NULL,
    emissions_by_source JSONB DEFAULT '{}',
    emissions_by_category JSONB DEFAULT '{}',
    baseline_comparison JSONB DEFAULT '{}',
    achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance schedules table
CREATE TABLE IF NOT EXISTS urjasync.maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES urjasync.devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    priority VARCHAR(50) DEFAULT 'medium',
    cost_estimate DECIMAL(10,2),
    service_provider VARCHAR(255),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device health table
CREATE TABLE IF NOT EXISTS urjasync.device_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES urjasync.devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    efficiency DECIMAL(5,4),
    temperature DECIMAL(6,2),
    vibration DECIMAL(6,4),
    power_consumption DECIMAL(10,2),
    operating_hours DECIMAL(10,2),
    error_count INTEGER DEFAULT 0,
    alerts JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation rules table
CREATE TABLE IF NOT EXISTS urjasync.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES urjasync.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    schedule JSONB,
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 5,
    trigger_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON urjasync.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON urjasync.users(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON urjasync.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_type ON urjasync.devices(type);
CREATE INDEX IF NOT EXISTS idx_devices_online ON urjasync.devices(is_online);
CREATE INDEX IF NOT EXISTS idx_energy_data_device_id ON urjasync.energy_data(device_id);
CREATE INDEX IF NOT EXISTS idx_energy_data_timestamp ON urjasync.energy_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON urjasync.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON urjasync.bills(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_bills_status ON urjasync.bills(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON urjasync.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON urjasync.payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON urjasync.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON urjasync.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_carbon_footprints_user_id ON urjasync.carbon_footprints(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_footprints_period ON urjasync.carbon_footprints(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_user_id ON urjasync.maintenance_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON urjasync.maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_device_health_device_id ON urjasync.device_health(device_id);
CREATE INDEX IF NOT EXISTS idx_device_health_timestamp ON urjasync.device_health(timestamp);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON urjasync.automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON urjasync.automation_rules(enabled);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION urjasync.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON urjasync.users FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON urjasync.devices FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON urjasync.bills FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON urjasync.payments FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_carbon_footprints_updated_at BEFORE UPDATE ON urjasync.carbon_footprints FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON urjasync.maintenance_schedules FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON urjasync.automation_rules FOR EACH ROW EXECUTE FUNCTION urjasync.update_updated_at_column();

-- Insert sample data
INSERT INTO urjasync.users (email, password_hash, first_name, last_name, is_verified) VALUES 
('admin@urjasync.com', '$2b$10$dummy_hash_for_admin', 'Admin', 'User', TRUE),
('demo@urjasync.com', '$2b$10$dummy_hash_for_demo', 'Demo', 'User', TRUE);

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA urjasync TO urjasync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA urjasync TO urjasync_user;

-- Output success message
SELECT 'UrjaSync database setup completed successfully!' as status;
