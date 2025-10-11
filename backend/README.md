# Animal Rescue Backend

Flask-based REST API for the Animal Rescue application.

## Features

- REST API endpoints for NGO data
- Location-based nearest NGO search using Haversine formula
- MySQL database integration
- CORS enabled for frontend communication

## Prerequisites

- Python 3.8+
- MySQL 5.7+ or MySQL 8.0+
- pip (Python package manager)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use virtual environment (recommended):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Database

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=animal_rescue
```

### 3. Create Database and Tables

Login to MySQL:

```bash
mysql -u root -p
```

Run the database schema:

```sql
source database.sql
```

Or manually:

```bash
mysql -u root -p < database.sql
```

### 4. Run the Application

```bash
python app.py
```

The server will start at `http://localhost:5000`

## API Endpoints

### GET /
- **Description**: API information and available endpoints
- **Response**: JSON with API details

### GET /api/ngos
- **Description**: Get all NGOs from database
- **Response**:
  ```json
  {
    "success": true,
    "ngos": [...]
  }
  ```

### POST /api/nearest-ngo
- **Description**: Find nearest NGO based on user location
- **Request Body**:
  ```json
  {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "ngo": {
      "id": 1,
      "name": "Animal Care Foundation",
      "phone": "+91-9876543210",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "address": "Andheri West, Mumbai, Maharashtra",
      "email": "contact@animalcare.org",
      "distance": 2.5
    },
    "user_location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  }
  ```

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── db_config.py        # Database connection configuration
├── utils.py            # Utility functions (distance calculation)
├── database.sql        # Database schema and sample data
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── README.md          # This file
```

## Technologies Used

- **Flask**: Web framework
- **Flask-CORS**: Cross-Origin Resource Sharing
- **mysql-connector-python**: MySQL database driver
- **python-dotenv**: Environment variable management

## Distance Calculation

The application uses the Haversine formula to calculate the great-circle distance between two points on Earth given their latitude and longitude. This provides accurate distance measurements in kilometers.
