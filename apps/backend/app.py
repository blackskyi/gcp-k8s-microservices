from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import redis
import os
import json
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://appuser:changeme123@postgres:5432/appdb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize database
db = SQLAlchemy(app)

# Initialize Redis
redis_url = os.getenv('REDIS_URL', 'redis://:redis123@redis:6379/0')
cache = redis.from_url(redis_url, decode_responses=True)

# Database Models
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# Create tables
with app.app_context():
    db.create_all()

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for container orchestration"""
    try:
        # Check database connection
        db.session.execute(db.text('SELECT 1'))
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'

    try:
        # Check Redis connection
        cache.ping()
        redis_status = 'healthy'
    except Exception as e:
        redis_status = f'unhealthy: {str(e)}'

    return jsonify({
        'status': 'healthy' if db_status == 'healthy' and redis_status == 'healthy' else 'degraded',
        'service': 'backend',
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {
            'database': db_status,
            'redis': redis_status
        }
    }), 200

# User endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users with caching"""
    try:
        # Check cache first
        cached_users = cache.get('users:all')
        if cached_users:
            return jsonify({
                'users': json.loads(cached_users),
                'from_cache': True
            })

        # Fetch from database
        users = User.query.all()
        users_data = [user.to_dict() for user in users]

        # Cache for 5 minutes
        cache.setex('users:all', 300, json.dumps(users_data))

        return jsonify({
            'users': users_data,
            'from_cache': False
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get specific user by ID"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create new user"""
    try:
        data = request.get_json()

        # Validate input
        if not data.get('username') or not data.get('email'):
            return jsonify({'error': 'Username and email are required'}), 400

        # Create user
        user = User(
            username=data['username'],
            email=data['email']
        )
        db.session.add(user)
        db.session.commit()

        # Invalidate cache
        cache.delete('users:all')

        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update existing user"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']

        db.session.commit()

        # Invalidate cache
        cache.delete('users:all')

        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user"""
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()

        # Invalidate cache
        cache.delete('users:all')

        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    try:
        # Check cache
        cached_stats = cache.get('stats')
        if cached_stats:
            return jsonify(json.loads(cached_stats))

        # Calculate stats
        total_users = User.query.count()
        recent_users = User.query.filter(
            User.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()

        stats = {
            'total_users': total_users,
            'recent_users': recent_users,
            'timestamp': datetime.utcnow().isoformat(),
            'cache_hits': cache.get('cache:hits') or 0
        }

        # Cache for 1 minute
        cache.setex('stats', 60, json.dumps(stats))

        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_ENV') == 'development')
