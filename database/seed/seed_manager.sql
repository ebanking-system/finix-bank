-- ==========================================================
-- Finix Bank - Manager User & Schema Seed Script
-- Purpose: One-time database seeding for the initial MANAGER account.
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
    CONSTRAINT fk_employees_users FOREIGN KEY (employee_id) REFERENCES users(user_id) ON DELETE CASCADE
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
