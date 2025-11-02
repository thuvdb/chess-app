#!/usr/bin/env python3
"""
Automated Setup Script for Chess Puzzle App
Thiết lập tự động toàn bộ ứng dụng từ đầu đến cuối
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import json

class ChessAppSetup:
    def __init__(self):
        self.root_dir = Path.cwd()
        self.colors = {
            'GREEN': '\033[92m',
            'YELLOW': '\033[93m',
            'RED': '\033[91m',
            'BLUE': '\033[94m',
            'END': '\033[0m'
        }
    
    def print_step(self, message, color='BLUE'):
        print(f"\n{self.colors[color]}{'='*60}")
        print(f"📌 {message}")
        print(f"{'='*60}{self.colors['END']}\n")
    
    def print_success(self, message):
        print(f"{self.colors['GREEN']}✅ {message}{self.colors['END']}")
    
    def print_error(self, message):
        print(f"{self.colors['RED']}❌ {message}{self.colors['END']}")
    
    def print_warning(self, message):
        print(f"{self.colors['YELLOW']}⚠️  {message}{self.colors['END']}")
    
    def run_command(self, command, cwd=None):
        """Chạy shell command"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=True,
                cwd=cwd,
                capture_output=True,
                text=True
            )
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr
    
    def check_dependencies(self):
        """Kiểm tra dependencies cần thiết"""
        self.print_step("Kiểm tra Dependencies", "BLUE")
        
        dependencies = {
            'python': 'python3 --version',
            'pip': 'pip3 --version',
            'node': 'node --version',
            'npm': 'npm --version',
            'git': 'git --version'
        }
        
        missing = []
        for name, command in dependencies.items():
            success, output = self.run_command(command)
            if success:
                version = output.strip().split()[-1]
                self.print_success(f"{name}: {version}")
            else:
                missing.append(name)
                self.print_error(f"{name}: Not found")
        
        if missing:
            self.print_error(f"Missing dependencies: {', '.join(missing)}")
            return False
        
        return True
    
    def create_directory_structure(self):
        """Tạo cấu trúc thư mục"""
        self.print_step("Tạo Cấu Trúc Thư Mục", "BLUE")
        
        directories = [
            'backend',
            'backend/tests',
            'frontend',
            'frontend/src',
            'frontend/src/components',
            'frontend/src/api',
            'frontend/src/utils',
            'scripts',
            'data',
            'output',
            'nginx',
            'docs'
        ]
        
        for directory in directories:
            path = self.root_dir / directory
            path.mkdir(parents=True, exist_ok=True)
            self.print_success(f"Created: {directory}")
    
    def setup_backend(self):
        """Setup Backend"""
        self.print_step("Setup Backend - Python Flask", "BLUE")
        
        backend_dir = self.root_dir / 'backend'
        
        # Tạo requirements.txt
        requirements = """Flask==3.0.0
Flask-CORS==4.0.0
python-chess==1.999
pdfplumber==0.10.3
"""
        
        req_file = backend_dir / 'requirements.txt'
        req_file.write_text(requirements)
        self.print_success("Created requirements.txt")
        
        # Install Python packages
        print("Installing Python packages...")
        success, output = self.run_command(
            'pip3 install -r requirements.txt',
            cwd=backend_dir
        )
        
        if success:
            self.print_success("Python packages installed")
        else:
            self.print_error("Failed to install Python packages")
            return False
        
        return True
    
    def setup_frontend(self):
        """Setup Frontend"""
        self.print_step("Setup Frontend - React App", "BLUE")
        
        frontend_dir = self.root_dir / 'frontend'
        
        # Tạo package.json
        package_json = {
            "name": "chess-puzzle-app",
            "version": "1.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "chess.js": "^1.0.0-beta.6",
                "react-chessboard": "^4.3.1",
                "lucide-react": "^0.263.1",
                "axios": "^1.6.0"
            },
            "devDependencies": {
                "@vitejs/plugin-react": "^4.2.0",
                "vite": "^5.0.0"
            }
        }
        
        pkg_file = frontend_dir / 'package.json'
        pkg_file.write_text(json.dumps(package_json, indent=2))
        self.print_success("Created package.json")
        
        # Install npm packages
        print("Installing npm packages (this may take a few minutes)...")
        success, output = self.run_command('npm install', cwd=frontend_dir)
        
        if success:
            self.print_success("npm packages installed")
        else:
            self.print_error("Failed to install npm packages")
            return False
        
        # Tạo vite.config.js
        vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
"""
        vite_file = frontend_dir / 'vite.config.js'
        vite_file.write_text(vite_config)
        self.print_success("Created vite.config.js")
        
        return True
    
    def extract_pdf_data(self):
        """Trích xuất dữ liệu từ PDF"""
        self.print_step("Trích Xuất Dữ Liệu Từ PDF", "YELLOW")
        
        pdf_path = self.root_dir / 'data' / 'RAMAKRISHNAN-MATE-IN-2 (1).pdf'
        
        if not pdf_path.exists():
            self.print_warning(f"PDF file not found: {pdf_path}")
            self.print_warning("Vui lòng copy file PDF vào thư mục 'data/'")
            return False
        
        scripts_dir = self.root_dir / 'scripts'
        
        # Copy parser script vào scripts/
        parser_content = open(__file__).read()  # Giả sử có sẵn
        
        print("Running PDF extraction...")
        success, output = self.run_command(
            'python chess_pdf_reader.py',
            cwd=scripts_dir
        )
        
        if success:
            self.print_success("PDF data extracted successfully")
            
            # Copy database to backend
            src_db = self.root_dir / 'output' / 'chess_puzzles.db'
            dst_db = self.root_dir / 'backend' / 'chess_puzzles.db'
            
            if src_db.exists():
                shutil.copy(src_db, dst_db)
                self.print_success("Database copied to backend")
            
            return True
        else:
            self.print_error("PDF extraction failed")
            return False
    
    def create_env_files(self):
        """Tạo environment files"""
        self.print_step("Tạo Environment Files", "BLUE")
        
        # Backend .env
        backend_env = """FLASK_ENV=development
DATABASE_URL=chess_puzzles.db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
"""
        backend_env_file = self.root_dir / 'backend' / '.env'
        backend_env_file.write_text(backend_env)
        self.print_success("Created backend/.env")
        
        # Frontend .env
        frontend_env = """VITE_API_URL=http://localhost:5000/api
"""
        frontend_env_file = self.root_dir / 'frontend' / '.env'
        frontend_env_file.write_text(frontend_env)
        self.print_success("Created frontend/.env")
    
    def create_readme(self):
        """Tạo README"""
        self.print_step("Tạo Documentation", "BLUE")
        
        readme = """# ♟️ Chess Puzzle Training App

Ứng dụng học cờ vua với 800 bài tập "Mate in 2" từ sách Ramakrishnan.

## 🚀 Quick Start

### Backend
```bash
cd backend
python app.py
```
Server chạy tại: http://localhost:5000

### Frontend
```bash
cd frontend
npm run dev
```
App chạy tại: http://localhost:3000

## 📦 Docker

```bash
docker-compose up -d
```

## 📚 API Endpoints

- `GET /api/positions/random` - Lấy puzzle ngẫu nhiên
- `GET /api/positions/<id>` - Lấy puzzle theo ID
- `POST /api/positions/<id>/verify` - Kiểm tra nước đi
- `GET /api/users/<id>/stats` - Thống kê người dùng

## 🎯 Features

- ✅ 800 bài tập mate in 2
- ✅ Giao diện kéo thả trực quan
- ✅ Theo dõi tiến độ
- ✅ Thống kê chi tiết
- ✅ Leaderboard
- ✅ Daily challenge

## 🛠️ Tech Stack

**Backend:**
- Flask (Python)
- SQLite
- Chess.js

**Frontend:**
- React
- Vite
- Tailwind CSS
- react-chessboard

## 📄 License

MIT
"""
        
        readme_file = self.root_dir / 'README.md'
        readme_file.write_text(readme)
        self.print_success("Created README.md")
    
    def create_gitignore(self):
        """Tạo .gitignore"""
        gitignore = """# Python
__pycache__/
*.py[cod]
*.egg-info/
venv/
env/

# Node
node_modules/
dist/
build/

# Database
*.db
*.sqlite

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
"""
        
        gitignore_file = self.root_dir / '.gitignore'
        gitignore_file.write_text(gitignore)
        self.print_success("Created .gitignore")
    
    def initialize_git(self):
        """Initialize Git repository"""
        self.print_step("Initialize Git Repository", "BLUE")
        
        if not (self.root_dir / '.git').exists():
            success, _ = self.run_command('git init')
            if success:
                self.print_success("Git repository initialized")
                
                # Initial commit
                self.run_command('git add .')
                self.run_command('git commit -m "Initial commit"')
                self.print_success("Initial commit created")
        else:
            self.print_warning("Git repository already exists")
    
    def print_final_instructions(self):
        """In hướng dẫn cuối cùng"""
        instructions = f"""
{self.colors['GREEN']}
╔════════════════════════════════════════════════════════════╗
║                  🎉 SETUP COMPLETE! 🎉                    ║
╚════════════════════════════════════════════════════════════╝
{self.colors['END']}

{self.colors['BLUE']}📋 Next Steps:{self.colors['END']}

1️⃣  {self.colors['YELLOW']}Start Backend:{self.colors['END']}
   cd backend
   python app.py
   
   → Backend running at: http://localhost:5000

2️⃣  {self.colors['YELLOW']}Start Frontend (in new terminal):{self.colors['END']}
   cd frontend
   npm run dev
   
   → Frontend running at: http://localhost:3000

3️⃣  {self.colors['YELLOW']}Test API:{self.colors['END']}
   curl http://localhost:5000/api/health

4️⃣  {self.colors['YELLOW']}Open browser:{self.colors['END']}
   http://localhost:3000

{self.colors['BLUE']}🐳 Using Docker:{self.colors['END']}
   docker-compose up -d

{self.colors['BLUE']}📚 Documentation:{self.colors['END']}
   - README.md - General overview
   - docs/DEPLOYMENT.md - Deployment guide
   - docs/API.md - API documentation

{self.colors['BLUE']}🎯 Quick Commands:{self.colors['END']}
   make build    - Build containers
   make up       - Start services
   make logs     - View logs
   make clean    - Clean everything

{self.colors['GREEN']}✨ Happy Coding! ✨{self.colors['END']}
"""
        print(instructions)
    
    def run_setup(self):
        """Chạy toàn bộ setup"""
        print(f"""
{self.colors['BLUE']}
╔════════════════════════════════════════════════════════════╗
║          Chess Puzzle App - Automated Setup               ║
║                                                            ║
║  This script will set up the entire application           ║
║  including backend, frontend, and database.               ║
╚════════════════════════════════════════════════════════════╝
{self.colors['END']}
""")
        
        # Confirm
        response = input(f"{self.colors['YELLOW']}Continue? (y/n): {self.colors['END']}")
        if response.lower() != 'y':
            print("Setup cancelled.")
            sys.exit(0)
        
        # Run setup steps
        steps = [
            ("Check Dependencies", self.check_dependencies),
            ("Create Directory Structure", self.create_directory_structure),
            ("Setup Backend", self.setup_backend),
            ("Setup Frontend", self.setup_frontend),
            ("Create Environment Files", self.create_env_files),
            ("Create Documentation", self.create_readme),
            ("Create .gitignore", self.create_gitignore),
            ("Initialize Git", self.initialize_git),
        ]
        
        failed_steps = []
        
        for step_name, step_func in steps:
            try:
                result = step_func()
                if result is False:
                    failed_steps.append(step_name)
            except Exception as e:
                self.print_error(f"{step_name} failed: {str(e)}")
                failed_steps.append(step_name)
        
        # Summary
        print(f"\n{self.colors['BLUE']}{'='*60}{self.colors['END']}")
        if failed_steps:
            self.print_warning(f"Setup completed with errors in: {', '.join(failed_steps)}")
        else:
            self.print_success("All setup steps completed successfully!")
        print(f"{self.colors['BLUE']}{'='*60}{self.colors['END']}\n")
        
        # Final instructions
        self.print_final_instructions()


def main():
    """Main entry point"""
    setup = ChessAppSetup()
    
    try:
        setup.run_setup()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Setup failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()