-- Create database
CREATE DATABASE IF NOT EXISTS animal_rescue;
USE animal_rescue;

-- Create NGOs table
CREATE TABLE IF NOT EXISTS ngos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample NGO data
INSERT INTO ngos (name, phone, latitude, longitude, address, email) VALUES
('Animal Care Foundation', '+91-9876543210', 19.0760, 72.8777, 'Andheri West, Mumbai, Maharashtra', 'contact@animalcare.org'),
('Stray Animal Rescue', '+91-9876543211', 28.7041, 77.1025, 'Connaught Place, New Delhi', 'rescue@strayanimals.org'),
('Wildlife Protection NGO', '+91-9876543212', 12.9716, 77.5946, 'Koramangala, Bangalore, Karnataka', 'info@wildlifeprotect.org'),
('Pet Rescue Center', '+91-9876543213', 13.0827, 80.2707, 'Anna Nagar, Chennai, Tamil Nadu', 'help@petrescue.org'),
('Animal Welfare Society', '+91-9876543214', 22.5726, 88.3639, 'Salt Lake, Kolkata, West Bengal', 'support@animalwelfare.org');

-- Create Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ngo_id INT NOT NULL,
    user_latitude DECIMAL(10, 8) NOT NULL,
    user_longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(500),
    status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
);

-- Create NGO Users table for authentication
CREATE TABLE IF NOT EXISTS ngo_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ngo_id INT NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
);

-- Insert sample NGO users (password is 'password123' for all)
INSERT INTO ngo_users (ngo_id, username, password) VALUES
(1, 'animalcare', 'password123'),
(2, 'strayrescue', 'password123'),
(3, 'wildlifeprotect', 'password123'),
(4, 'petrescue', 'password123'),
(5, 'animalwelfare', 'password123');
