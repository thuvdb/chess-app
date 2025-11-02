"""
PDF Reader cho Ramakrishnan Chess Puzzles
Đọc và trích xuất text từ PDF, sau đó parse sang FEN
"""

import pdfplumber
import re
import json
import sqlite3
from pathlib import Path


class RamakrishnanPDFReader:
    """Đọc và parse PDF sách cờ Ramakrishnan"""
    
    def __init__(self):
        self.piece_map = {
            'Z': '', '0': '',
            'O': 'P', 'M': 'N', 'A': 'B', 'S': 'R', 'L': 'B', 'J': 'K',
            'o': 'p', 'm': 'n', 'a': 'b', 's': 'r', 'l': 'b', 'j': 'k',
            'P': 'P', 'N': 'N', 'B': 'B', 'R': 'R', 'Q': 'Q', 'K': 'K',
            'p': 'p', 'n': 'n', 'b': 'b', 'r': 'r', 'q': 'q', 'k': 'k',
        }
    
    def read_pdf(self, pdf_path: str) -> str:
        """Đọc toàn bộ text từ PDF"""
        print(f"📖 Đang đọc file: {pdf_path}")
        
        full_text = ""
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"📄 Tổng số trang: {total_pages}")
            
            for i, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
                
                if i % 10 == 0:
                    print(f"   Đã đọc {i}/{total_pages} trang...")
        
        print(f"✅ Hoàn thành! Tổng ký tự: {len(full_text):,}")
        return full_text
    
    def convert_row_to_fen(self, row: str) -> str:
        """Chuyển hàng PDF sang FEN"""
        fen_row = ''
        empty_count = 0
        
        for char in row:
            if char in ['Z', '0']:
                empty_count += 1
            else:
                if empty_count > 0:
                    fen_row += str(empty_count)
                    empty_count = 0
                piece = self.piece_map.get(char, '')
                if piece:
                    fen_row += piece
        
        if empty_count > 0:
            fen_row += str(empty_count)
        
        return fen_row
    
    def convert_board_to_fen(self, board_notation: str) -> str:
        """Chuyển board notation sang FEN"""
        rows = board_notation.split('/')
        fen_rows = [self.convert_row_to_fen(row) for row in rows]
        return '/'.join(fen_rows) + ' w KQkq - 0 1'
    
    def extract_positions(self, text: str) -> list:
        """Trích xuất tất cả vị trí từ text"""
        positions = []
        lines = text.split('\n')
        
        current_pos = None
        current_board = []
        
        print("🔍 Đang trích xuất vị trí...")
        
        for line in lines:
            line = line.strip()
            
            # Kiểm tra số vị trí
            if line.isdigit():
                pos_num = int(line)
                if 1 <= pos_num <= 800:
                    # Lưu vị trí trước
                    if current_pos and len(current_board) == 8:
                        board_str = '/'.join(current_board)
                        fen = self.convert_board_to_fen(board_str)
                        positions.append({
                            'id': current_pos,
                            'fen': fen,
                            'board_notation': board_str
                        })
                        
                        if len(positions) % 50 == 0:
                            print(f"   Đã trích xuất {len(positions)} vị trí...")
                    
                    current_pos = pos_num
                    current_board = []
            
            # Kiểm tra hàng bàn cờ
            elif current_pos and len(line) > 0:
                parts = line.split()
                if len(parts) >= 2:
                    first_char = parts[0]
                    if first_char in '87654321':
                        board_row = parts[1]
                        # Validate: chỉ chứa ký tự hợp lệ
                        if all(c in 'ZOMALJSomaljspnbrqkPNBRQK0' for c in board_row):
                            current_board.append(board_row)
        
        # Lưu vị trí cuối
        if current_pos and len(current_board) == 8:
            board_str = '/'.join(current_board)
            fen = self.convert_board_to_fen(board_str)
            positions.append({
                'id': current_pos,
                'fen': fen,
                'board_notation': board_str
            })
        
        print(f"✅ Đã trích xuất {len(positions)} vị trí")
        return positions
    
    def extract_solutions(self, text: str) -> dict:
        """Trích xuất lời giải"""
        solutions = {}
        
        print("🔍 Đang trích xuất lời giải...")
        
        # Pattern: Solution-1: 1. h7+ Kh8 2. Rf8 Checkmate 1-0
        pattern = r'Solution-(\d+):\s+(.+?)\s+(?:Checkmate\s+)?(?:1-0|0-1)'
        matches = re.findall(pattern, text, re.MULTILINE)
        
        for match in matches:
            pos_id = int(match[0])
            solution = match[1].strip()
            solutions[pos_id] = solution
        
        print(f"✅ Đã trích xuất {len(solutions)} lời giải")
        return solutions
    
    def combine_data(self, positions: list, solutions: dict) -> list:
        """Gộp positions và solutions"""
        for pos in positions:
            pos['solution'] = solutions.get(pos['id'], '')
            pos['difficulty'] = 'mate_in_2'
            pos['source'] = 'Ramakrishnan - Mate in Two - All 4 Volumes'
            pos['tags'] = ['tactics', 'checkmate', 'puzzle']
        
        return positions
    
    def save_to_json(self, data: list, filename: str):
        """Lưu JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"💾 Đã lưu {len(data)} vị trí vào {filename}")
    
    def save_to_sqlite(self, data: list, db_name: str):
        """Lưu SQLite"""
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
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
        
        cursor.execute('DELETE FROM positions')  # Xóa dữ liệu cũ
        
        for pos in data:
            cursor.execute('''
            INSERT INTO positions 
            (id, fen, solution, difficulty, source, tags, board_notation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                pos['id'],
                pos['fen'],
                pos['solution'],
                pos['difficulty'],
                pos['source'],
                ','.join(pos['tags']),
                pos['board_notation']
            ))
        
        conn.commit()
        conn.close()
        print(f"💾 Đã lưu {len(data)} vị trí vào {db_name}")
    
    def process_pdf(self, pdf_path: str, output_json: str = 'chess_positions.json',
                   output_db: str = 'chess_puzzles.db'):
        """Xử lý toàn bộ PDF"""
        print("\n" + "=" * 60)
        print("RAMAKRISHNAN CHESS PDF PARSER")
        print("=" * 60 + "\n")
        
        # Đọc PDF
        text = self.read_pdf(pdf_path)
        
        # Trích xuất positions
        positions = self.extract_positions(text)
        
        # Trích xuất solutions
        solutions = self.extract_solutions(text)
        
        # Gộp dữ liệu
        final_data = self.combine_data(positions, solutions)
        
        # Hiển thị thống kê
        print("\n" + "=" * 60)
        print("📊 THỐNG KÊ")
        print("=" * 60)
        print(f"Tổng vị trí:       {len(final_data)}")
        print(f"Có lời giải:       {sum(1 for p in final_data if p['solution'])}")
        print(f"Chưa có lời giải:  {sum(1 for p in final_data if not p['solution'])}")
        
        # Hiển thị mẫu
        print("\n" + "=" * 60)
        print("📋 VÍ DỤ 5 VỊ TRÍ ĐẦU TIÊN")
        print("=" * 60)
        for pos in final_data[:5]:
            print(f"\n🔢 Vị trí #{pos['id']}")
            print(f"   FEN: {pos['fen']}")
            print(f"   Giải: {pos['solution']}")
        
        # Lưu files
        print("\n" + "=" * 60)
        print("💾 ĐANG LƯU KẾT QUẢ")
        print("=" * 60)
        self.save_to_json(final_data, output_json)
        self.save_to_sqlite(final_data, output_db)
        
        print("\n" + "=" * 60)
        print("✅ HOÀN THÀNH!")
        print("=" * 60)
        
        return final_data


def main():
    """Chạy chương trình"""
    import sys
    
    # Kiểm tra file PDF
    pdf_file = "RAMAKRISHNAN-MATE-IN-2.pdf"
    
    if not Path(pdf_file).exists():
        print(f"❌ Không tìm thấy file: {pdf_file}")
        print("\n💡 Hướng dẫn:")
        print("1. Đặt file PDF vào cùng thư mục với script")
        print("2. Hoặc chỉ định đường dẫn đầy đủ:")
        print(f"   python script.py <path_to_pdf>")
        sys.exit(1)
    
    # Kiểm tra thư viện
    try:
        import pdfplumber
    except ImportError:
        print("❌ Chưa cài đặt pdfplumber")
        print("💡 Cài đặt: pip install pdfplumber")
        sys.exit(1)
    
    # Chạy parser
    reader = RamakrishnanPDFReader()
    positions = reader.process_pdf(
        pdf_path=pdf_file,
        output_json='chess_positions.json',
        output_db='chess_puzzles.db'
    )
    
    print(f"\n📁 Files đã tạo:")
    print(f"   - chess_positions.json ({Path('chess_positions.json').stat().st_size:,} bytes)")
    print(f"   - chess_puzzles.db ({Path('chess_puzzles.db').stat().st_size:,} bytes)")
    
    print("\n🎯 Bước tiếp theo:")
    print("1. Import JSON vào web app")
    print("2. Sử dụng SQLite để tạo API")
    print("3. Tích hợp với chess.js để hiển thị bàn cờ")


if __name__ == "__main__":
    main()
