# 🚀 HƯỚNG DẪN TRIỂN KHAI ỨNG DỤNG HỌC CỜ VUA

## 📋 MỤC LỤC
1. [Cài đặt môi trường](#cài-đặt-môi-trường)
2. [Trích xuất dữ liệu từ PDF](#bước-1-trích-xuất-dữ-liệu)
3. [Chạy Backend API](#bước-2-chạy-backend)
4. [Chạy Frontend](#bước-3-chạy-frontend)
5. [Tích hợp API thực tế](#bước-4-tích-hợp-api)
6. [Deploy lên production](#bước-5-deploy)

---

## 🛠️ CÀI ĐẶT MÔI TRƯỜNG

### Requirements
```bash
# Python 3.8+
python --version

# Node.js 16+
node --version
npm --version
```

### Cài đặt Python packages
```bash
pip install flask flask-cors pdfplumber sqlite3
```

### Cài đặt Node packages
```bash
npm install react react-dom chess.js react-chessboard lucide-react
```

---

## 📦 BƯỚC 1: TRÍCH XUẤT DỮ LIỆU

### 1.1. Chuẩn bị file
```
chess-app/
├── data/
│   └── RAMAKRISHNAN-MATE-IN-2.pdf
├── scripts/
│   ├── chess_pdf_reader.py
│   └── chess_pdf_parser.py
└── output/
    ├── chess_positions.json
    └── chess_puzzles.db
```

### 1.2. Chạy script trích xuất
```bash
cd scripts
python chess_pdf_reader.py
```

**Output:**
- ✅ `chess_positions.json` - 800 vị trí với FEN và lời giải
- ✅ `chess_puzzles.db` - SQLite database

### 1.3. Kiểm tra dữ liệu
```bash
# Xem JSON
cat output/chess_positions.json | head -50

# Query SQLite
sqlite3 output/chess_puzzles.db
sqlite> SELECT COUNT(*) FROM positions;
# Kết quả: 800

sqlite> SELECT * FROM positions LIMIT 3;
```

---

## 🔧 BƯỚC 2: CHẠY BACKEND

### 2.1. Cấu trúc thư mục
```
backend/
├── app.py                 # Flask API
├── chess_puzzles.db       # Database (copy từ output/)
├── requirements.txt
└── .env
```

### 2.2. Tạo requirements.txt
```txt
Flask==3.0.0
Flask-CORS==4.0.0
python-chess==1.999
```

### 2.3. Chạy API server
```bash
cd backend
python app.py
```

**Output:**
```
🚀 Starting Chess Puzzle API Server...
✅ Database initialized
📡 Server running on http://localhost:5000

📚 API Endpoints:
   GET  /api/health
   GET  /api/positions/random
   GET  /api/positions/<id>
   ...
```

### 2.4. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Get random puzzle
curl http://localhost:5000/api/positions/random

# Get specific puzzle
curl http://localhost:5000/api/positions/1
```

---

## 🎨 BƯỚC 3: CHẠY FRONTEND

### 3.1. Cấu trúc React
```
frontend/
├── src/
│   ├── App.jsx            # Main component
│   ├── components/
│   │   ├── ChessBoard.jsx
│   │   ├── StatsPanel.jsx
│   │   └── PuzzleInfo.jsx
│   ├── api/
│   │   └── puzzleApi.js   # API calls
│   └── utils/
│       └── chessHelper.js
├── package.json
└── .env
```

### 3.2. Tạo package.json
```json
{
  "name": "chess-puzzle-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "chess.js": "^1.0.0-beta.6",
    "react-chessboard": "^4.3.1",
    "lucide-react": "^0.263.1",
    "axios": "^1.6.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### 3.3. Chạy dev server
```bash
cd frontend
npm install
npm run dev
```

**Output:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🔌 BƯỚC 4: TÍCH HỢP API THỰC TẾ

### 4.1. Tạo API client
```javascript
// src/api/puzzleApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const puzzleApi = {
  // Get random puzzle
  getRandomPuzzle: async () => {
    const response = await axios.get(`${API_BASE_URL}/positions/random`);
    return response.data;
  },

  // Get specific puzzle
  getPuzzle: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${id}`);
    return response.data;
  },

  // Get solution
  getSolution: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${id}/solution`);
    return response.data;
  },

  // Verify move
  verifyMove: async (id, move) => {
    const response = await axios.post(`${API_BASE_URL}/positions/${id}/verify`, {
      move: move
    });
    return response.data;
  },

  // Update progress
  updateProgress: async (userId, positionId, solved, timeSpent) => {
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/progress`, {
      position_id: positionId,
      solved: solved,
      time_spent: timeSpent
    });
    return response.data;
  },

  // Get user stats
  getUserStats: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`);
    return response.data;
  }
};
```

### 4.2. Cập nhật component để dùng API
```javascript
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { puzzleApi } from './api/puzzleApi';

const App = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNewPuzzle = async () => {
    setLoading(true);
    try {
      const puzzle = await puzzleApi.getRandomPuzzle();
      setPosition(puzzle);
    } catch (error) {
      console.error('Error loading puzzle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (move) => {
    if (!position) return;
    
    try {
      const result = await puzzleApi.verifyMove(position.id, move);
      if (result.correct) {
        // Update progress
        await puzzleApi.updateProgress(1, position.id, true, timer);
        setMessage('🎉 Chính xác!');
      } else {
        setMessage('❌ Sai rồi!');
      }
    } catch (error) {
      console.error('Error verifying move:', error);
    }
  };

  // ... rest of component
};
```

---

## 🌐 BƯỚC 5: DEPLOY LÊN PRODUCTION

### 5.1. Deploy Backend (Railway/Render)

#### Sử dụng Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

#### hoặc Render.com
1. Push code lên GitHub
2. Tạo Web Service mới trên Render
3. Kết nối với repo GitHub
4. Cấu hình:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`

### 5.2. Deploy Frontend (Vercel/Netlify)

#### Sử dụng Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

#### hoặc Netlify
```bash
# Build
npm run build

# Deploy
netlify deploy --prod
```

### 5.3. Cấu hình Environment Variables

**Backend (.env):**
```env
FLASK_ENV=production
DATABASE_URL=chess_puzzles.db
CORS_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📱 TÍNH NĂNG BỔ SUNG

### 6.1. Thêm Authentication
```bash
pip install flask-jwt-extended
```

```python
# backend/auth.py
from flask_jwt_extended import JWTManager, create_access_token

jwt = JWTManager(app)

@app.route('/api/auth/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    
    # Verify credentials
    if verify_user(username, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({'error': 'Invalid credentials'}), 401
```

### 6.2. Thêm Daily Challenge
```python
@app.route('/api/daily-challenge', methods=['GET'])
def daily_challenge():
    # Get puzzle of the day based on date
    today = datetime.now().date()
    day_number = (today - datetime(2024, 1, 1).date()).days
    puzzle_id = (day_number % 800) + 1
    
    # ... return puzzle
```

### 6.3. Thêm Social Features
```python
# Share puzzle
@app.route('/api/share/<int:position_id>', methods=['POST'])
def share_puzzle(position_id):
    # Generate shareable link
    share_url = f"https://yourapp.com/puzzle/{position_id}"
    return jsonify({'share_url': share_url})
```

---

## 🧪 TESTING

### Backend Tests
```python
# tests/test_api.py
import unittest
from app import app

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
    
    def test_health(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
    
    def test_random_puzzle(self):
        response = self.app.get('/api/positions/random')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('fen', data)
```

### Frontend Tests
```javascript
// tests/ChessBoard.test.jsx
import { render, screen } from '@testing-library/react';
import ChessBoard from '../components/ChessBoard';

test('renders chessboard', () => {
  render(<ChessBoard fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" />);
  expect(screen.getByRole('img')).toBeInTheDocument();
});
```

---

## 📊 MONITORING & ANALYTICS

### Backend Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

@app.route('/api/positions/random')
def get_random():
    logging.info('Random puzzle requested')
    # ...
```

### Frontend Analytics
```javascript
// Google Analytics
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track puzzle loads
const loadPuzzle = () => {
  ReactGA.event({
    category: 'Puzzle',
    action: 'Load',
    label: 'Random'
  });
  // ...
};
```

---

## 🔒 SECURITY BEST PRACTICES

1. **Rate Limiting**
```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/positions/random')
@limiter.limit("10 per minute")
def get_random():
    # ...
```

2. **Input Validation**
```python
from marshmallow import Schema, fields, validate

class MoveSchema(Schema):
    move = fields.Str(required=True, validate=validate.Length(min=2, max=6))
```

3. **CORS Configuration**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourapp.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**1. "Module not found" error**
```bash
pip install --upgrade -r requirements.txt
npm install
```

**2. "Database locked" error**
```bash
# Increase timeout
sqlite3.connect('db.sqlite', timeout=10)
```

**3. "CORS error"**
```python
# Check CORS settings
CORS(app, origins="*")  # For development only!
```

---

## 🎯 ROADMAP

- [ ] Mobile app (React Native)
- [ ] Multiplayer mode
- [ ] Tournament system
- [ ] AI analysis with Stockfish
- [ ] Video lessons
- [ ] Opening trainer
- [ ] Puzzle rating system
- [ ] Achievement badges

---

## 📚 TÀI LIỆU THAM KHẢO

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [react-chessboard](https://www.npmjs.com/package/react-chessboard)
- [Stockfish Engine](https://stockfishchess.org/)

---

## 🤝 CONTRIBUTING

Contributions are welcome! Please read CONTRIBUTING.md for details.

---

## 📄 LICENSE

MIT License - See LICENSE file for details

---

**Made with ♥ by Chess Enthusiasts**
