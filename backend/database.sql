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
