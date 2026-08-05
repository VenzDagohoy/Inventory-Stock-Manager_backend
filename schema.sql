-- Create database
CREATE DATABASE inventory_db;
USE inventory_db;

-- Create products table
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT unique_product_name UNIQUE (name)
);

-- Add products
INSERT INTO products (name, price, stock) 
VALUES
    ('KEYBOARD', 49.99, 15),
    ('MOUSE', 29.99, 50),
    ('TYPE-C CABLE', 12.50, 100),
    ('WEBCAM', 35.00, 8);