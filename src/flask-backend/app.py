import jwt
import datetime
from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_user
from werkzeug.security import generate_password_hash,check_password_hash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Initialize the app, database, and login manager
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # For sessions
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'  # SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app, supports_credentials=True)  # Enable CORS with support for credentials

login_manager = LoginManager()
login_manager.init_app(app)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Registration endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists!"}), 400

    # Hash password before saving (use strong hash in production)
    hashed_password = generate_password_hash(password, method='scrypt')

    # Create new user
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT Token for the newly registered user
    token = jwt.encode(
        {'user_id': new_user.id, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)},
        app.secret_key,
        algorithm='HS256'
    )

    return jsonify({"message": "User registered successfully!", "token": token}), 201


# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        # Generate JWT token
        token = jwt.encode(
            {'user_id': user.id, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)}, 
            app.secret_key, 
            algorithm='HS256'
        )
        return jsonify({'token': token}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if token:
        try:
            token = token.split(" ")[1]  # Extract token from "Bearer <token>"
            decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = decoded_token['user_id']
            user = User.query.get(user_id)
            return jsonify({"message": "Welcome, user!"}), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    else:
        return jsonify({"error": "Token missing"}), 401


if __name__ == "__main__":
    app.run(debug=True)
