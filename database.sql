-- SQL for MySQL (PHPMyAdmin)
-- Create Database
CREATE DATABASE IF NOT EXISTS cocinette_db;
USE cocinette_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('mesero', 'cajero', 'admin') NOT NULL,
    pin VARCHAR(10) NOT NULL,
    avatar TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('food', 'drinks', 'desserts') NOT NULL,
    subcategory VARCHAR(50),
    drinkType ENUM('hot', 'cold'),
    destination ENUM('kitchen', 'bar') NOT NULL
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tables (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    shape ENUM('local', 'takeout', 'delivery') NOT NULL,
    status ENUM('available', 'occupied', 'reserved', 'payment_pending') NOT NULL DEFAULT 'available',
    zone VARCHAR(50),
    waiterId VARCHAR(50),
    FOREIGN KEY (waiterId) REFERENCES users(id)
);

-- Comandas (Orders) Table
CREATE TABLE IF NOT EXISTS comandas (
    folio INT PRIMARY KEY AUTO_INCREMENT,
    tableId VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    generalNotes TEXT,
    createdBy VARCHAR(50),
    FOREIGN KEY (tableId) REFERENCES tables(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Comanda Items Table
CREATE TABLE IF NOT EXISTS comanda_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    folio INT,
    productId VARCHAR(50),
    quantity INT NOT NULL,
    plate INT NOT NULL,
    notes TEXT,
    isCancelled BOOLEAN DEFAULT FALSE,
    cancellationReason TEXT,
    cancelledBy VARCHAR(50),
    FOREIGN KEY (folio) REFERENCES comandas(folio),
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (cancelledBy) REFERENCES users(id)
);

-- Closed Accounts Table
CREATE TABLE IF NOT EXISTS closed_accounts (
    id VARCHAR(50) PRIMARY KEY,
    tableLabel VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tip DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    paymentMethod ENUM('card', 'cash', 'transfer') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    isPaid BOOLEAN DEFAULT TRUE,
    status ENUM('completed', 'cancelled') NOT NULL DEFAULT 'completed',
    cancellationReason TEXT,
    cancelledBy VARCHAR(50),
    FOREIGN KEY (cancelledBy) REFERENCES users(id)
);

-- Initial Data
INSERT IGNORE INTO users (id, name, role, pin, avatar) VALUES 
('m1', 'Mesero 1', 'mesero', '1111', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
('m2', 'Mesero 2', 'mesero', '2222', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'),
('m3', 'Mesero 3', 'mesero', '3333', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo'),
('c1', 'Cajero 1', 'cajero', '4444', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb'),
('c2', 'Cajero 2', 'cajero', '5555', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine'),
('a1', 'Admin 1', 'admin', '6666', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian'),
('a2', 'Admin 2', 'admin', '7777', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha'),
('a3', 'Admin 3', 'admin', '8888', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey');

INSERT IGNORE INTO products (id, name, price, category, subcategory, destination) VALUES
('e1', 'Guacamole con Totopos', 65, 'food', 'Entradas', 'kitchen'),
('e2', 'Queso Fundido', 85, 'food', 'Entradas', 'kitchen'),
('t1', 'Taco al Pastor', 15, 'food', 'Tacos', 'kitchen'),
('t2', 'Taco de Bistec', 18, 'food', 'Tacos', 'kitchen'),
('c1', 'Café Americano', 25, 'drinks', 'Café', 'bar'),
('ce1', 'Cerveza Corona', 45, 'drinks', 'Cerveza', 'bar'),
('s1', 'Flan Napolitano', 35, 'desserts', 'Postres', 'bar');
