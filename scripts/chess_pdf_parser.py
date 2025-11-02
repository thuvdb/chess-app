"""
Chess PDF FEN Extractor
Trích xuất 800 vị trí từ sách Ramakrishnan - Mate in Two
"""

import re
import json
import sqlite3
from typing import List, Dict

class ChessPDFParser:
    """Parser để trích xuất FEN từ PDF Ramakrishnan"""
    
    def __init__(self):
        # Mapping ký hiệu PDF sang ký hiệu FEN chuẩn
        self.piece_map = {
            'Z': '',  # Ô trống
            '0': '',  # Ô trống
            # Quân trắng (viết hoa trong FEN)
            'P': 'P', 'N': 'N', 'B': 'B', 'R': 'R', 'Q': 'Q', 'K': 'K',
            # Quân đen (viết thường trong FEN)
            'p': 'p', 'n': 'n', 'b': 'b', 'r': 'r', 'q': 'q', 'k': 'k',
            # Ký hiệu đặc biệt trong PDF - Quân trắng
            'O': 'P',  # Pawn
            'M': 'N',  # Knight
            'A': 'B',  # Bishop
            'S': 'R',  # Rook
            'L': 'B',  # Bishop (alternate)
            'J': 'K',  # King
            # Ký hiệu đặc biệt trong PDF - Quân đen
            'o': 'p',  # pawn
            'm': 'n',  # knight
            'a': 'b',  # bishop
            's': 'r',  # rook
            'l': 'b',  # bishop (alternate)
            'j': 'k',  # king
        }
    
    def convert_row_to_fen(self, row: str) -> str:
        """Chuyển đổi một hàng từ ký hiệu PDF sang FEN"""
        fen_row = ''
        empty_count = 0
        
        for char in row:
            if char in ['Z', '0']:
                empty_count += 1
            else:
                if empty_count > 0:
                    fen_row += str(empty_count)
                    empty_count = 0
                piece = self.piece_map.get(char, char)
                if piece:  # Chỉ thêm nếu không phải ô trống
                    fen_row += piece
        
        if empty_count > 0:
            fen_row += str(empty_count)
        
        return fen_row
    
    def convert_board_to_fen(self, board_notation: str) -> str:
        """
        Chuyển đổi ký hiệu bàn cờ từ PDF sang FEN chuẩn
        Input: "0Z0m0ZkZ/Z0Z0Z0o0/0ZbZpZBO/..."
        Output: "2n2k1/6p1/2b1p1B1/... w KQkq - 0 1"
        """
        rows = board_notation.split('/')
        fen_rows = [self.convert_row_to_fen(row) for row in rows]
        
        # Thêm thông tin bổ sung cho FEN đầy đủ
        # w = White to move, KQkq = castling rights, - = no en passant, 0 1 = move numbers
        fen = '/'.join(fen_rows) + ' w KQkq - 0 1'
        
        return fen
    
    def extract_positions_from_text(self, text_content: str) -> List[Dict]:
        """Trích xuất tất cả vị trí từ text của PDF"""
        positions = []
        
        # Pattern để tìm vị trí (số và 8 hàng bàn cờ)
        # Tìm các block có dạng: số + 8 hàng với ký hiệu
        position_pattern = r'(\d+)\s+8\s+([\w/]+?)(?:/[\w]+){7}\s+a b c d e f g h'
        
        # Tìm tất cả các block vị trí
        lines = text_content.split('\n')
        current_pos = None
        current_board = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Kiểm tra nếu là số vị trí mới
            if line.isdigit() and int(line) <= 800:
                # Lưu vị trí trước đó nếu có
                if current_pos and len(current_board) == 8:
                    board_str = '/'.join(current_board)
                    fen = self.convert_board_to_fen(board_str)
                    positions.append({
                        'id': current_pos,
                        'fen': fen,
                        'board_notation': board_str
                    })
                
                # Bắt đầu vị trí mới
                current_pos = int(line)
                current_board = []
            
            # Kiểm tra nếu là hàng bàn cờ (bắt đầu bằng số 8,7,6...)
            elif line and line[0].isdigit() and current_pos:
                # Lấy phần ký hiệu bàn cờ (sau số hàng)
                parts = line.split()
                if len(parts) >= 2 and parts[0] in '87654321':
                    board_row = parts[1]
                    current_board.append(board_row)
        
        # Lưu vị trí cuối cùng
        if current_pos and len(current_board) == 8:
            board_str = '/'.join(current_board)
            fen = self.convert_board_to_fen(board_str)
            positions.append({
                'id': current_pos,
                'fen': fen,
                'board_notation': board_str
            })
        
        return positions
    
    def extract_solutions(self, text_content: str) -> Dict[int, str]:
        """Trích xuất các lời giải từ phần SOLUTIONS"""
        solutions = {}
        
        # Pattern: Solution-1: 1. h7+ Kh8 2. Rf8 Checkmate 1-0
        pattern = r'Solution-(\d+):\s+(.+?)\s+(?:Checkmate\s+)?(?:1-0|0-1)'
        
        matches = re.findall(pattern, text_content, re.MULTILINE)
        
        for match in matches:
            pos_id = int(match[0])
            solution = match[1].strip()
            solutions[pos_id] = solution
        
        return solutions
    
    def parse_pdf_text(self, text_content: str) -> List[Dict]:
        """Parse toàn bộ nội dung PDF"""
        print("🔍 Bắt đầu trích xuất vị trí...")
        positions = self.extract_positions_from_text(text_content)
        print(f"✅ Đã tìm thấy {len(positions)} vị trí")
        
        print("🔍 Trích xuất lời giải...")
        solutions = self.extract_solutions(text_content)
        print(f"✅ Đã tìm thấy {len(solutions)} lời giải")
        
        # Gắn solution vào positions
        for pos in positions:
            pos['solution'] = solutions.get(pos['id'], '')
            pos['difficulty'] = 'mate_in_2'
            pos['source'] = 'Ramakrishnan - Mate in Two - All 4 Volumes'
            pos['tags'] = ['tactics', 'checkmate', 'puzzle']
        
        return positions
    
    def save_to_json(self, positions: List[Dict], filename: str = 'chess_positions.json'):
        """Lưu vào file JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(positions, f, indent=2, ensure_ascii=False)
        print(f"💾 Đã lưu vào {filename}")
    
    def save_to_sqlite(self, positions: List[Dict], db_name: str = 'chess_puzzles.db'):
        """Lưu vào SQLite database"""
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # Tạo bảng
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
        
        # Insert dữ liệu
        for pos in positions:
            cursor.execute('''
            INSERT OR REPLACE INTO positions 
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
        print(f"💾 Đã lưu vào {db_name}")
    
    def save_to_csv(self, positions: List[Dict], filename: str = 'chess_positions.csv'):
        """Lưu vào file CSV"""
        import csv
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'fen', 'solution', 'difficulty', 'source'])
            writer.writeheader()
            
            for pos in positions:
                writer.writerow({
                    'id': pos['id'],
                    'fen': pos['fen'],
                    'solution': pos['solution'],
                    'difficulty': pos['difficulty'],
                    'source': pos['source']
                })
        
        print(f"💾 Đã lưu vào {filename}")


def main():
    """Hàm chính để chạy parser"""
    
    # Đọc file PDF (đã convert sang text)
    # Bạn cần dùng pdfplumber hoặc PyPDF2 để đọc file PDF
    
    print("=" * 60)
    print("Chess PDF FEN Extractor")
    print("Ramakrishnan - Mate in Two - All 4 Volumes")
    print("=" * 60)
    print()
    
    # Demo với dữ liệu mẫu
    sample_text = """
1
8 0Z0m0ZkZ
7 Z0Z0Z0o0
6 0ZbZpZBO
5 opZ0O0l0
4 0Zpo0Z0O
3 Z0O0Z0ZK
2 0ZPZ0Z0Z
1 Z0Z0ZRZ0
a b c d e f g h

2
8 0ZbZ0Z0Z
7 Z0Z0ZpZ0
6 0Z0L0o0Z
5 j0Z0oPZ0
4 pZ0ZBZ0Z
3 ZPZ0a0Z0
2 PZPZ0ZPO
1 ZKM0Z0l0
a b c d e f g h

SOLUTIONS
Solution-1: 1. h7+ Kh8 2. Rf8 Checkmate 1-0
Solution-2: 1. b4+ Kb5 2. Bd3 Checkmate 1-0
"""
    
    # Tạo parser
    parser = ChessPDFParser()
    
    # Parse dữ liệu
    positions = parser.parse_pdf_text(sample_text)
    
    # Hiển thị kết quả
    print("\n📊 KẾT QUẢ TRÍCH XUẤT:")
    print("-" * 60)
    for pos in positions[:5]:  # Hiển thị 5 vị trí đầu
        print(f"\n🔢 Vị trí {pos['id']}:")
        print(f"   FEN: {pos['fen']}")
        print(f"   Giải: {pos['solution']}")
    
    print("\n" + "=" * 60)
    print(f"✅ HOÀN THÀNH! Tổng số vị trí: {len(positions)}")
    print("=" * 60)
    
    # Lưu kết quả
    parser.save_to_json(positions, 'chess_positions.json')
    parser.save_to_sqlite(positions, 'chess_puzzles.db')
    parser.save_to_csv(positions, 'chess_positions.csv')
    
    print("\n📝 HƯỚNG DẪN SỬ DỤNG:")
    print("-" * 60)
    print("1. Cài đặt pdfplumber: pip install pdfplumber")
    print("2. Đọc file PDF:")
    print("   import pdfplumber")
    print("   with pdfplumber.open('RAMAKRISHNAN-MATE-IN-2.pdf') as pdf:")
    print("       text = ''")
    print("       for page in pdf.pages:")
    print("           text += page.extract_text()")
    print("3. Parse text:")
    print("   parser = ChessPDFParser()")
    print("   positions = parser.parse_pdf_text(text)")


if __name__ == "__main__":
    main()
