"""
Chess Puzzle API Backend
RESTful API cho ứng dụng học cờ vua
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime
from functools import wraps

app = Flask(__name__)
# Cấu hình CORS - CHO PHÉP FRONTEND RENDER
CORS(app, origins= [ 
    'http://localhost:3000',
    'http://localhost:5173',
    'https://chess-app-zmni.onrender.com',
    'https://my-app.onrender.com'
    ], 
supports_credentials=True,
allow_headers=['Content-Type', 'Authorization'],
methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])  

DATABASE = 'data/chess_puzzles.db'

# ==================== DATABASE HELPERS ====================

def get_db():
    """Kết nối database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Trả về dict thay vì tuple
    return conn

def init_db():
    """Khởi tạo database với các bảng cần thiết"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Bảng positions (đã có từ script parse)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY,
        fen TEXT NOT NULL,
        solution TEXT,
        difficulty TEXT,
        source TEXT,
        tags TEXT,
        board_notation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Bảng users (người dùng)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Bảng user_progress (theo dõi tiến độ)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        position_id INTEGER NOT NULL,
        solved BOOLEAN DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        last_attempt TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (position_id) REFERENCES positions(id),
        UNIQUE(user_id, position_id)
    )
    ''')
    
    # Bảng statistics (thống kê tổng)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        total_solved INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0,
        avg_time INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        last_solved_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

# ==================== DECORATORS ====================

def json_response(f):
    """Decorator để tự động xử lý JSON response"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            result = f(*args, **kwargs)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return decorated_function

# ==================== API ENDPOINTS ====================

@app.route('/api/health', methods=['GET'])
@json_response
def health_check():
    """Kiểm tra server hoạt động"""
    return {
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }

@app.route('/api/positions/count', methods=['GET'])
@json_response
def get_positions_count():
    """Lấy tổng số puzzle positions"""
    difficulty = request.args.get('difficulty', 'mate_in_2')
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT COUNT(*) as total
        FROM positions 
        WHERE difficulty = ?
    ''', (difficulty,))
    
    row = cursor.fetchone()
    conn.close()
    
    return {
        'total': row['total'],
        'difficulty': difficulty
    }

@app.route('/api/positions/random', methods=['GET'])
@json_response
def get_random_position():
    """Lấy 1 vị trí ngẫu nhiên"""
    difficulty = request.args.get('difficulty', 'mate_in_2')
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, fen, difficulty, tags
        FROM positions 
        WHERE difficulty = ?
        ORDER BY RANDOM() 
        LIMIT 1
    ''', (difficulty,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'fen': row['fen'],
            'difficulty': row['difficulty'],
            'tags': row['tags'].split(',') if row['tags'] else []
        }
    else:
        return {'error': 'No positions found'}, 404

@app.route('/api/positions/by-index/<int:index>', methods=['GET'])
@json_response
def get_position_by_index(index):
    """Lấy vị trí theo index (thứ tự)"""
    difficulty = request.args.get('difficulty', 'mate_in_2')
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, fen, difficulty, tags
        FROM positions 
        WHERE difficulty = ?
        ORDER BY id
        LIMIT 1 OFFSET ?
    ''', (difficulty, index))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'fen': row['fen'],
            'difficulty': row['difficulty'],
            'tags': row['tags'].split(',') if row['tags'] else []
        }
    else:
        return {'error': 'Position not found'}, 404

@app.route('/api/positions/<int:position_id>', methods=['GET'])
@json_response
def get_position(position_id):
    """Lấy vị trí theo ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, fen, difficulty, tags
        FROM positions 
        WHERE id = ?
    ''', (position_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'fen': row['fen'],
            'difficulty': row['difficulty'],
            'tags': row['tags'].split(',') if row['tags'] else []
        }
    else:
        return {'error': 'Position not found'}, 404

@app.route('/api/positions/<int:position_id>/solution', methods=['GET'])
@json_response
def get_solution(position_id):
    """Lấy lời giải (chỉ sau khi người dùng yêu cầu)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT solution
        FROM positions 
        WHERE id = ?
    ''', (position_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'position_id': position_id,
            'solution': row['solution']
        }
    else:
        return {'error': 'Position not found'}, 404

@app.route('/api/positions/<int:position_id>/verify', methods=['POST'])
@json_response
def verify_move(position_id):
    """Kiểm tra nước đi của người dùng"""
    data = request.get_json()
    user_move = data.get('move', '')  # VD: "h7+"
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT solution
        FROM positions 
        WHERE id = ?
    ''', (position_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {'error': 'Position not found'}, 404
    
    solution = row['solution']
    # Lấy nước đi đầu tiên trong solution
    first_move = solution.split()[1] if solution else ''  # "1. h7+" -> "h7+"
    
    is_correct = user_move.lower() == first_move.lower()
    
    return {
        'correct': is_correct,
        'user_move': user_move,
        'expected_move': first_move if not is_correct else None
    }

@app.route('/api/users', methods=['POST'])
@json_response
def create_user():
    """Tạo user mới"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    
    if not username or not email:
        return {'error': 'Username and email required'}, 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email)
            VALUES (?, ?)
        ''', (username, email))
        
        user_id = cursor.lastrowid
        
        # Tạo stats ban đầu
        cursor.execute('''
            INSERT INTO user_stats (user_id)
            VALUES (?)
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        return {
            'user_id': user_id,
            'username': username,
            'email': email
        }
    except sqlite3.IntegrityError:
        conn.close()
        return {'error': 'Username or email already exists'}, 409

@app.route('/api/users/<int:user_id>/progress', methods=['POST'])
@json_response
def update_progress(user_id):
    """Cập nhật tiến độ người dùng"""
    data = request.get_json()
    position_id = data.get('position_id')
    solved = data.get('solved', False)
    time_spent = data.get('time_spent', 0)  # seconds
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Kiểm tra xem đã có record chưa
    cursor.execute('''
        SELECT attempts FROM user_progress
        WHERE user_id = ? AND position_id = ?
    ''', (user_id, position_id))
    
    row = cursor.fetchone()
    
    if row:
        # Update existing record
        new_attempts = row['attempts'] + 1
        cursor.execute('''
            UPDATE user_progress
            SET solved = ?,
                attempts = ?,
                time_spent = time_spent + ?,
                last_attempt = CURRENT_TIMESTAMP
            WHERE user_id = ? AND position_id = ?
        ''', (solved, new_attempts, time_spent, user_id, position_id))
    else:
        # Insert new record
        cursor.execute('''
            INSERT INTO user_progress 
            (user_id, position_id, solved, attempts, time_spent, last_attempt)
            VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
        ''', (user_id, position_id, solved, time_spent))
    
    # Update user stats if solved
    if solved:
        cursor.execute('''
            UPDATE user_stats
            SET total_solved = total_solved + 1,
                total_attempts = total_attempts + 1,
                last_solved_date = DATE('now')
            WHERE user_id = ?
        ''', (user_id,))
        
        # Update success rate
        cursor.execute('''
            UPDATE user_stats
            SET success_rate = (total_solved * 100.0 / total_attempts)
            WHERE user_id = ?
        ''', (user_id,))
    
    conn.commit()
    conn.close()
    
    return {'message': 'Progress updated successfully'}

@app.route('/api/users/<int:user_id>/stats', methods=['GET'])
@json_response
def get_user_stats(user_id):
    """Lấy thống kê người dùng"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM user_stats
        WHERE user_id = ?
    ''', (user_id,))
    
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return {'error': 'User not found'}, 404
    
    # Lấy top 5 vị trí gần nhất
    cursor.execute('''
        SELECT p.id, p.fen, up.solved, up.attempts, up.last_attempt
        FROM user_progress up
        JOIN positions p ON up.position_id = p.id
        WHERE up.user_id = ?
        ORDER BY up.last_attempt DESC
        LIMIT 5
    ''', (user_id,))
    
    recent = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        'total_solved': row['total_solved'],
        'total_attempts': row['total_attempts'],
        'success_rate': round(row['success_rate'], 2),
        'streak': row['streak'],
        'last_solved_date': row['last_solved_date'],
        'recent_positions': recent
    }

@app.route('/api/leaderboard', methods=['GET'])
@json_response
def get_leaderboard():
    """Lấy bảng xếp hạng"""
    limit = request.args.get('limit', 10, type=int)
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            u.username,
            s.total_solved,
            s.success_rate,
            s.streak
        FROM user_stats s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.total_solved DESC, s.success_rate DESC
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    leaderboard = [
        {
            'rank': i + 1,
            'username': row['username'],
            'total_solved': row['total_solved'],
            'success_rate': round(row['success_rate'], 2),
            'streak': row['streak']
        }
        for i, row in enumerate(rows)
    ]
    
    return {'leaderboard': leaderboard}

@app.route('/api/stats/global', methods=['GET'])
@json_response
def get_global_stats():
    """Thống kê toàn hệ thống"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Tổng số vị trí
    cursor.execute('SELECT COUNT(*) as total FROM positions')
    total_positions = cursor.fetchone()['total']
    
    # Tổng số users
    cursor.execute('SELECT COUNT(*) as total FROM users')
    total_users = cursor.fetchone()['total']
    
    # Vị trí được giải nhiều nhất
    cursor.execute('''
        SELECT position_id, COUNT(*) as solve_count
        FROM user_progress
        WHERE solved = 1
        GROUP BY position_id
        ORDER BY solve_count DESC
        LIMIT 5
    ''')
    most_solved = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        'total_positions': total_positions,
        'total_users': total_users,
        'most_solved': most_solved
    }

# ==================== ADMIN ENDPOINTS ====================

@app.route('/api/admin/positions/bulk', methods=['POST'])
@json_response
def bulk_insert_positions():
    """Bulk insert positions (dùng khi import từ JSON)"""
    data = request.get_json()
    positions = data.get('positions', [])
    
    conn = get_db()
    cursor = conn.cursor()
    
    inserted = 0
    for pos in positions:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO positions 
                (id, fen, solution, difficulty, source, tags)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                pos['id'],
                pos['fen'],
                pos.get('solution', ''),
                pos.get('difficulty', 'mate_in_2'),
                pos.get('source', ''),
                ','.join(pos.get('tags', []))
            ))
            inserted += 1
        except Exception as e:
            print(f"Error inserting position {pos['id']}: {e}")
    
    conn.commit()
    conn.close()
    
    return {'inserted': inserted, 'total': len(positions)}

# ==================== MAIN ====================

if __name__ == '__main__':
    print("🚀 Starting Chess Puzzle API Server...")
    init_db()
    print("📡 Server running on http://localhost:5000")
    print("\n📚 API Endpoints:")
    print("   GET  /api/health")
    print("   GET  /api/positions/random")
    print("   GET  /api/positions/<id>")
    print("   GET  /api/positions/<id>/solution")
    print("   POST /api/positions/<id>/verify")
    print("   POST /api/users")
    print("   POST /api/users/<id>/progress")
    print("   GET  /api/users/<id>/stats")
    print("   GET  /api/leaderboard")
    print("   GET  /api/stats/global")
    print("\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
