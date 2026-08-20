CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- User table
CREATE TABLE users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_email (email)
);

-- Products table
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    sold INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Link product to user
    CONSTRAINT fk_product_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Enforce product names only within the same users inventory
    CONSTRAINT unique_user_product_name UNIQUE (user_id, name)
);

-- Daily history  
CREATE TABLE daily_history (     
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,     
    user_id INT UNSIGNED NOT NULL,     
    record_date DATE NOT NULL,     
    total_sold INT UNSIGNED NOT NULL DEFAULT 0,     
    total_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0.00,     
    items_sold_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          
    -- Link history to user     
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);

--  Display table
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM daily_history;
