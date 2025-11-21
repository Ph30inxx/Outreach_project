from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db_config import get_db_connection
from utils import find_nearest_ngo
import decimal
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            '/api/nearest-ngo': 'POST - Find nearest NGO to location',
            '/api/complaints': 'POST - Submit a complaint to an NGO',
            '/api/complaints/all': 'GET - Get all complaints (public)',
            '/api/ngo/login': 'POST - NGO user login',
            '/api/ngo/complaints': 'GET - Get complaints for logged in NGO',
            '/api/ngo/complaints/:id/resolve': 'PUT - Resolve a complaint',
            '/uploads/<filename>': 'GET - Serve uploaded images'
        }
    })

@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    """Submit a complaint with description and optional image"""
    if 'ngo_id' not in request.form or 'description' not in request.form:
        return jsonify({'error': 'NGO ID and description are required'}), 400

    if 'latitude' not in request.form or 'longitude' not in request.form:
        return jsonify({'error': 'User location (latitude and longitude) is required'}), 400

    try:
        ngo_id = int(request.form['ngo_id'])
        description = request.form['description']
        user_lat = float(request.form['latitude'])
        user_lon = float(request.form['longitude'])
    except (ValueError, KeyError):
        return jsonify({'error': 'Invalid data format'}), 400

    image_path = None

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = str(int(os.times()[4] * 1000))
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_path = filename

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            'INSERT INTO complaints (ngo_id, user_latitude, user_longitude, description, image_path) VALUES (%s, %s, %s, %s, %s)',
            (ngo_id, user_lat, user_lon, description, image_path)
        )
        connection.commit()
        complaint_id = cursor.lastrowid

        return jsonify({
            'success': True,
            'message': 'Complaint submitted successfully',
            'complaint_id': complaint_id
        })
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/complaints/all', methods=['GET'])
def get_all_complaints():
    """Get all complaints with NGO details for public status page"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute('''
            SELECT c.*, n.name as ngo_name, n.phone as ngo_phone, n.address as ngo_address
            FROM complaints c
            JOIN ngos n ON c.ngo_id = n.id
            ORDER BY c.created_at DESC
        ''')
        complaints = cursor.fetchall()

        for complaint in complaints:
            complaint['user_latitude'] = float(complaint['user_latitude'])
            complaint['user_longitude'] = float(complaint['user_longitude'])
            if complaint.get('created_at'):
                complaint['created_at'] = str(complaint['created_at'])

        return jsonify({
            'success': True,
            'complaints': complaints
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/ngo/login', methods=['POST'])
def ngo_login():
    """NGO user login"""
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username']
    password = data['password']

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            'SELECT nu.*, n.name as ngo_name, n.email as ngo_email, n.phone as ngo_phone FROM ngo_users nu JOIN ngos n ON nu.ngo_id = n.id WHERE nu.username = %s',
            (username,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401

        if user['password'] != password:
            return jsonify({'error': 'Invalid username or password'}), 401

        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'ngo_id': user['ngo_id'],
                'ngo_name': user['ngo_name'],
                'ngo_email': user['ngo_email'],
                'ngo_phone': user['ngo_phone']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/ngo/complaints/<int:ngo_id>', methods=['GET'])
def get_ngo_complaints(ngo_id):
    """Get all complaints for a specific NGO"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            'SELECT * FROM complaints WHERE ngo_id = %s ORDER BY created_at DESC',
            (ngo_id,)
        )
        complaints = cursor.fetchall()

        for complaint in complaints:
            complaint['user_latitude'] = float(complaint['user_latitude'])
            complaint['user_longitude'] = float(complaint['user_longitude'])
            if complaint.get('created_at'):
                complaint['created_at'] = str(complaint['created_at'])

        return jsonify({
            'success': True,
            'complaints': complaints
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/ngo/complaints/<int:complaint_id>/resolve', methods=['PUT'])
def resolve_complaint(complaint_id):
    """Mark a complaint as resolved"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            'UPDATE complaints SET status = %s WHERE id = %s',
            ('resolved', complaint_id)
        )
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Complaint not found'}), 404

        return jsonify({
            'success': True,
            'message': 'Complaint marked as resolved'
        })
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
