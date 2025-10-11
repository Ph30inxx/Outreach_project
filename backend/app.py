from flask import Flask, request, jsonify
from flask_cors import CORS
from db_config import get_db_connection
from utils import find_nearest_ngo
import decimal

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

@app.route('/')
def home():
    return jsonify({
        'message': 'Animal Rescue API',
        'endpoints': {
            '/api/ngos': 'GET - Get all NGOs',
            '/api/nearest-ngo': 'POST - Find nearest NGO to location'
        }
    })

@app.route('/api/ngos', methods=['GET'])
def get_all_ngos():
    """Get all NGOs from database"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute('SELECT * FROM ngos')
        ngos = cursor.fetchall()

        # Convert Decimal to float for JSON serialization
        for ngo in ngos:
            ngo['latitude'] = float(ngo['latitude'])
            ngo['longitude'] = float(ngo['longitude'])
            if ngo.get('created_at'):
                ngo['created_at'] = str(ngo['created_at'])

        return jsonify({'success': True, 'ngos': ngos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/nearest-ngo', methods=['POST'])
def get_nearest_ngo():
    """Find nearest NGO based on user's location"""
    data = request.get_json()

    if not data or 'latitude' not in data or 'longitude' not in data:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    try:
        user_lat = float(data['latitude'])
        user_lon = float(data['longitude'])
    except ValueError:
        return jsonify({'error': 'Invalid latitude or longitude format'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute('SELECT * FROM ngos')
        ngos = cursor.fetchall()

        if not ngos:
            return jsonify({'error': 'No NGOs found in database'}), 404

        # Convert Decimal to float
        for ngo in ngos:
            ngo['latitude'] = float(ngo['latitude'])
            ngo['longitude'] = float(ngo['longitude'])
            if ngo.get('created_at'):
                ngo['created_at'] = str(ngo['created_at'])

        # Find nearest NGO
        nearest = find_nearest_ngo(user_lat, user_lon, ngos)

        return jsonify({
            'success': True,
            'ngo': nearest,
            'user_location': {
                'latitude': user_lat,
                'longitude': user_lon
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
