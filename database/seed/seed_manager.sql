-- ==========================================================
-- Finix Bank - Manager User & Schema Seed Script
-- Purpose: One-time database seeding for the initial MANAGER account,
--          Treasury customer profile, and internal Bank Treasury account.
-- Usage: Run this script directly against your MySQL database.
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(1024) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    profile_photo_path VARCHAR(255),
    CONSTRAINT fk_employees_users FOREIGN KEY (employee_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGINT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    dob DATE NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    address VARCHAR(255),
    CONSTRAINT fk_customers_users FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS accounts (
    account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    ifsc_code VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1. Insert into `users` table
-- Default seed credentials:
-- Email: manager@finixbank.com
-- Initial Password: Password@123 (BCrypt encoded)
-- Role: MANAGER
INSERT INTO users (email, password_hash, role, is_active, must_change_password)
VALUES (
    'manager@finixbank.com',
    '$2a$10$sradoEsd5WVxkJ7eQRHVPuKorU6lBLXz4Wi5ii.2TQNDpmsOxVP/u',
    'MANAGER',
    1,
    0
)
ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$sradoEsd5WVxkJ7eQRHVPuKorU6lBLXz4Wi5ii.2TQNDpmsOxVP/u',
    role = 'MANAGER';

-- 2. Insert into `employees` table (linked to the manager's user_id)
INSERT INTO employees (employee_id, first_name, middle_name, last_name, department, designation)
SELECT 
    user_id,
    'Executive',
    'Branch',
    'Manager',
    'MANAGEMENT',
    'MANAGER'
FROM users 
WHERE email = 'manager@finixbank.com'
ON DUPLICATE KEY UPDATE designation = 'MANAGER', department = 'MANAGEMENT';

-- 3. Insert into `customers` table (linked to the manager's user_id as Treasury Profile)
INSERT INTO customers (customer_id, first_name, middle_name, last_name, dob, mobile, address)
SELECT 
    user_id,
    'Finix',
    'Bank',
    'Treasury',
    '1990-01-01',
    '9999999999',
    'Finix Bank Head Office'
FROM users 
WHERE email = 'manager@finixbank.com'
ON DUPLICATE KEY UPDATE 
    first_name = 'Finix', 
    middle_name = 'Bank', 
    last_name = 'Treasury';

-- 4. Insert into `accounts` table (Internal Treasury Account: 000000000000)
INSERT INTO accounts (customer_id, account_number, account_type, balance, ifsc_code, status, created_date, last_updated)
SELECT 
    customer_id,
    '000000000000',
    'SAVINGS',
    100000000.0000,
    'FINX0000001',
    'ACTIVE',
    NOW(),
    NOW()
FROM customers 
WHERE customer_id = (SELECT user_id FROM users WHERE email = 'manager@finixbank.com')
ON DUPLICATE KEY UPDATE 
    balance = 100000000.0000, 
    status = 'ACTIVE';
