# Animal Rescue Web Application

A full-stack web application that helps people quickly connect with the nearest animal rescue NGO when they find an injured animal. The app uses geolocation to find the user's position and suggests the closest NGO with contact information.

## Features

- Real-time geolocation access
- Find nearest animal rescue NGO based on user location
- Direct phone call functionality
- Responsive design for mobile and desktop
- Distance calculation using Haversine formula
- MySQL database for NGO information storage

## Tech Stack

### Frontend
- React.js
- CSS3 with modern gradients and animations
- Geolocation API

### Backend
- Flask (Python)
- Flask-CORS
- MySQL database
- RESTful API

## Project Structure

```
Outreach_project/
├── backend/
│   ├── app.py              # Flask application
│   ├── db_config.py        # Database configuration
│   ├── utils.py            # Utility functions
│   ├── database.sql        # Database schema
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Backend documentation
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # Entry point
│   ├── package.json       # Node dependencies
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+
- MySQL 5.7+ or 8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=animal_rescue
```

5. Create database and import schema:
```bash
mysql -u root -p < database.sql
```

6. Run the Flask server:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

1. Open the application in your browser at `http://localhost:3000`
2. Click "Get Help Now" button
3. Allow location access when prompted
4. View the nearest NGO information
5. Click "Call Now" to directly call the NGO

## API Endpoints

### GET /api/ngos
Get all NGOs from database

### POST /api/nearest-ngo
Find nearest NGO based on location
```json
Request:
{
  "latitude": 19.0760,
  "longitude": 72.8777
}

Response:
{
  "success": true,
  "ngo": {
    "name": "Animal Care Foundation",
    "phone": "+91-9876543210",
    "distance": 2.5,
    "address": "Andheri West, Mumbai",
    ...
  }
}
```

## Database Schema

```sql
ngos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## How It Works

1. User clicks "Get Help Now"
2. Browser requests location permission
3. Frontend sends latitude/longitude to backend API
4. Backend calculates distances to all NGOs using Haversine formula
5. Returns nearest NGO with distance
6. User can call NGO directly with one click

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
