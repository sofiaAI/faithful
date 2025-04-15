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
CORS(app, supports_credentials=True, origins=["http://localhost:3000"], 
     resources={r"/*": {"origins": ["http://localhost:3000"]}})  # Enable CORS with support for credentials

login_manager = LoginManager()
login_manager.init_app(app)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_date = db.Column(db.Date, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('goals', lazy=True))

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.date.today)
    content = db.Column(db.Text, nullable=False)
    mood = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('journal_entries', lazy=True))


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
        {'user_id': new_user.id, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12)},
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
            {'user_id': user.id, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12)}, 
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


@app.route('/goals', methods=['POST'])
def create_goal():
    goal = request.get_json().get('goal')
    token = request.headers.get('Authorization').split(" ")[1]
    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    new_goal = Goal(
        title=goal.get('title'),
        description=goal.get('description'),
        completed=False,
        target_date=datetime.datetime.strptime(goal.get('targetDate'), '%Y-%m-%d').date() if goal.get('targetDate') else None,
        user_id=user_id
    )
    db.session.add(new_goal)
    db.session.commit()

    return jsonify({"message": "Goal created successfully!"}), 201


@app.route('/goals', methods=['GET'])
def get_goals():
    token = request.headers.get('Authorization').split(" ")[1]
    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    goals = Goal.query.filter_by(user_id=user_id).all()
    goals_data = [{"id": goal.id, "title": goal.title, "description": goal.description, "completed": goal.completed, "target_date": goal.target_date} for goal in goals]
    return jsonify(goals_data), 200


@app.route('/journal', methods=['POST'])
def create_journal_entry():
    data = request.get_json().get('entry')
    token = request.headers.get('Authorization').split(" ")[1]
    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    new_entry = JournalEntry(
        content=data.get('content'),
        mood=data.get('mood'),
        user_id=user_id
    )
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Journal entry created successfully!"}), 201


@app.route('/journal', methods=['GET'])
def get_journal_entries():
    token = request.headers.get('Authorization').split(" ")[1]
    try:
        decoded_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    entries = JournalEntry.query.filter_by(user_id=user_id).all()
    entries_data = [{"id": entry.id, "content": entry.content, "mood": entry.mood} for entry in entries]

    return jsonify(entries_data), 200

if __name__ == "__main__":
    app.run(debug=True)
