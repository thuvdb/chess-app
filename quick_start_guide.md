# ⚡ QUICK START GUIDE - 5 PHÚT SETUP

## 🎯 Mục tiêu
Chạy được ứng dụng hoàn chỉnh trong 5 phút!

---

## 📋 CHUẨN BỊ

### ✅ Checklist
- [ ] Python 3.8+ đã cài
- [ ] Node.js 16+ đã cài  
- [ ] File PDF `RAMAKRISHNAN-MATE-IN-2.pdf`

### Kiểm tra nhanh:
```bash
python3 --version   # Phải >= 3.8
node --version      # Phải >= 16
npm --version
```

---

## 🚀 OPTION 1: AUTO SETUP (RECOMMENDED)

### Bước 1: Download và chạy setup script
```bash
# Clone hoặc tạo thư mục mới
mkdir chess-app && cd chess-app

# Copy script setup.py vào đây
# Sau đó chạy:
python3 setup.py
```

Script sẽ tự động:
- ✅ Tạo cấu trúc thư mục
- ✅ Install dependencies
- ✅ Setup backend & frontend
- ✅ Tạo env files
- ✅ Init git

### Bước 2: Copy file PDF
```bash
cp /path/to/RAMAKRISHNAN-MATE-IN-2\ \(1\).pdf data/
```

### Bước 3: Extract dữ liệu
```bash
cd scripts
python3 chess_pdf_reader.py
```

### Bước 4: Chạy app
```bash
# Terminal 1 - Backend
cd backend
python3 app.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### ✨ Xong! Mở browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🐳 OPTION 2: DOCKER (SIÊU NHANH!)

### Nếu bạn có Docker:
```bash
# Clone project
git clone <your-repo>
cd chess-app

# Copy PDF vào data/
cp /path/to/PDF data/

# Chạy!
docker-compose up -d
```

### Kiểm tra:
```bash
docker-compose ps
docker-compose logs -f
```

### Mở app:
- http://localhost:3000

---

## 🔧 OPTION 3: MANUAL SETUP

### A. Setup Backend

```bash
# 1. Tạo thư mục
mkdir -p backend scripts data output
cd backend

# 2. Install Python packages
pip3 install flask flask-cors pdfplumber

# 3. Tạo app.py (copy từ artifacts)

# 4. Chạy
python3 app.py
```

### B. Extract Data

```bash
cd ../scripts

# 1. Tạo chess_pdf_reader.py (copy từ artifacts)

# 2. Copy PDF
cp /path/to/PDF ../data/

# 3. Chạy
python3 chess_pdf_reader.py

# 4. Copy database
cp ../output/chess_puzzles.db ../backend/
```

### C. Setup Frontend

```bash
cd ../frontend

# 1. Tạo package.json
npm init -y

# 2. Install packages
npm install react react-dom chess.js react-chessboard lucide-react vite @vitejs/plugin-react

# 3. Tạo src/App.jsx (copy từ artifacts)

# 4. Tạo vite.config.js

# 5. Chạy
npm run dev
```

---

## 🧪 TESTING

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get random puzzle
curl http://localhost:5000/api/positions/random

# Get specific puzzle
curl http://localhost:5000/api/positions/1

# Get solution
curl http://localhost:5000/api/positions/1/solution
```

### Test Frontend
1. Mở http://localhost:3000
2. Click "Bài Mới" → Nên load puzzle
3. Thử kéo quân cờ
4. Click "Xem Giải" → Nên hiện solution

---

## 🐛 TROUBLESHOOTING

### ❌ "Module not found"
```bash
# Backend
pip3 install -r requirements.txt

# Frontend  
npm install
```

### ❌ "Port already in use"
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### ❌ "CORS error"
Kiểm tra trong `backend/app.py`:
```python
CORS(app, origins="*")  # For dev only
```

### ❌ "Database not found"
```bash
# Copy lại database
cp output/chess_puzzles.db backend/
```

### ❌ "Chess pieces not showing"
- Xóa `node_modules` và install lại:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 VERIFY SUCCESS

### Backend ✅
```bash
curl http://localhost:5000/api/positions/random
```
Kết quả:
```json
{
  "id": 42,
  "fen": "...",
  "difficulty": "mate_in_2",
  "tags": ["tactics", "checkmate"]
}
```

### Frontend ✅
- Bàn cờ hiển thị
- Có thể kéo quân
- Timer chạy
- Stats hiển thị

---

## 🎮 USAGE GUIDE

### Cách chơi:
1. **Load puzzle**: Click "Bài Mới"
2. **Di chuyển**: Kéo thả quân cờ
3. **Kiểm tra**: App tự động check nước đi
4. **Gợi ý**: Click "Gợi Ý" nếu bí
5. **Xem giải**: Click "Xem Giải" để xem lời giải đầy đủ

### Keyboard shortcuts:
- `Space`: Bài mới
- `H`: Gợi ý
- `S`: Xem/ẩn giải
- `R`: Reset bàn cờ

---

## 📈 NEXT STEPS

### Sau khi app chạy được:

1. **Tùy chỉnh giao diện**
   - Sửa màu sắc trong Tailwind
   - Thêm animations
   - Custom chess pieces

2. **Thêm features**
   - User authentication
   - Leaderboard
   - Daily challenge
   - Social sharing

3. **Deploy production**
   - Backend → Railway/Render
   - Frontend → Vercel/Netlify
   - Database → PostgreSQL

4. **Tối ưu**
   - Add caching
   - Compress images
   - Code splitting

---

## 📞 SUPPORT

### Gặp vấn đề?

1. **Check logs:**
   ```bash
   # Backend
   tail -f backend/app.log
   
   # Docker
   docker-compose logs -f
   ```

2. **Debug mode:**
   ```bash
   # Backend
   FLASK_DEBUG=1 python app.py
   
   # Frontend
   npm run dev -- --debug
   ```

3. **Reset everything:**
   ```bash
   # Xóa và tạo lại
   rm -rf node_modules backend/__pycache__ *.db
   # Sau đó setup lại
   ```

---

## ✨ TIPS & TRICKS

### Performance:
- Dùng `React.memo` cho components
- Lazy load chess pieces
- Index database queries
- Enable gzip compression

### UX:
- Thêm sound effects khi di chuyển
- Animation cho checkmate
- Celebration khi giải đúng
- Dark mode toggle

### SEO (nếu public):
- Add meta tags
- Generate sitemap
- Implement SSR
- Add structured data

---

## 🎯 CHECKLIST HOÀN THÀNH

Đánh dấu khi hoàn thành:

- [ ] Backend API chạy được
- [ ] Frontend hiển thị
- [ ] Load được puzzles
- [ ] Di chuyển quân cờ OK
- [ ] Verify moves hoạt động
- [ ] Stats tracking OK
- [ ] Database có 800 puzzles
- [ ] CORS configured đúng
- [ ] Git initialized
- [ ] README created

**🎉 HOÀN THÀNH! Chúc mừng bạn!**

---

## 📚 RESOURCES

- [Flask Docs](https://flask.palletsprojects.com/)
- [React Docs](https://react.dev/)
- [Chess.js](https://github.com/jhlywa/chess.js)
- [Docker Docs](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**💡 Pro Tip**: Bookmark trang này để tham khảo sau!

**Made with ♥ for Chess Enthusiasts**
