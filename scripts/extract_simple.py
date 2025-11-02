"""
Script đơn giản để extract dữ liệu từ PDF Ramakrishnan
"""

import json
import sqlite3
import re
from pathlib import Path

# Dữ liệu mẫu từ PDF (10 vị trí đầu tiên)
# Bạn có thể thêm nhiều hơn sau
sample_data = [
    {
        "id": 1,
        "board_notation": "0Z0m0ZkZ/Z0Z0Z0o0/0ZbZpZBO/opZ0O0l0/0Zpo0Z0O/Z0O0Z0ZK/0ZPZ0Z0Z/Z0Z0ZRZ0",
        "solution": "1. h7+ Kh8 2. Rf8#"
    },
    {
        "id": 2,
        "board_notation": "0ZbZ0Z0Z/Z0Z0ZpZ0/0Z0L0o0Z/j0Z0oPZ0/pZ0ZBZ0Z/ZPZ0a0Z0/PZPZ0ZPO/ZKM0Z0l0",
        "solution": "1. b4+ Kb5 2. Bd3#"
    },
    {
        "id": 3,
        "board_notation": "0ZrZ0j0s/Z0ZQZpo0/pZ0ZbZ0o/Z0Z0ZPOn/0Z0Z0Z0O/oqZ0Z0Z0/NZ0Z0Z0Z/J0ARS0Z0",
        "solution": "1. Qxc8+ Bxc8 2. Rd8#"
    },
    {
        "id": 4,
        "board_notation": "0Z0Z0j0Z/o0Z0lro0/0Z0Z0Z0o/Z0Z0ZpZ0/0OQZnO0Z/ZBZRZ0Z0/PZ0Z0O0O/ZKZ0Z0Z0",
        "solution": "1. Rd8+ Qxd8 2. Qxf7#"
    },
    {
        "id": 5,
        "board_notation": "0Z0a0Z0j/Z0Z0ZbZ0/pZqA0m0Z/Z0O0Z0Lp/0Z0Z0Z0o/Z0Z0Z0O0/POBZ0Z0Z/J0Z0M0Z0",
        "solution": "1. Qh6+ Kg8 2. Qf8#"
    },
    {
        "id": 6,
        "board_notation": "rZnZqmrZ/Z0o0Z0Zk/0oPZpLpo/aPZpOpZ0/0Z0O0O0Z/ARZ0ZNS0/0Z0ZBO0O/Z0Z0Z0ZK",
        "solution": "1. Ng5+ hxg5 2. Rh3#"
    },
    {
        "id": 7,
        "board_notation": "0Z0Zrj0Z/Z0l0ZpaB/po0Z0Z0Z/Z0Z0Z0ZQ/0Z0o0Z0Z/ZPm0Z0Z0/PA0Z0ZPO/Z0Z0ZRZK",
        "solution": "1. Ba3+ Re7 2. Qxf7#"
    },
    {
        "id": 8,
        "board_notation": "kZ0Z0Z0s/ZpZ0ZpZ0/pZ0Z0lpZ/Z0ZRZ0Zp/0O0ZQZnO/S0Z0Z0O0/PZ0Z0ZBZ/Z0Z0Z0J0",
        "solution": "1. Rd8+ Rxd8 2. Qxb7#"
    },
    {
        "id": 9,
        "board_notation": "rZ0Z0Z0j/ZQZ0Z0op/0m0Z0o0Z/ZPZ0Z0Z0/pZ0Z0Z0Z/Z0Z0S0Z0/0Z0O0OPO/ZqZ0ZBJ0",
        "solution": "1. Qxa8+ Nxa8 2. Re8#"
    },
    {
        "id": 10,
        "board_notation": "0L0Z0Z0Z/ZpZ0jpZ0/0ZpZ0ZpZ/Z0O0Z0ZN/0O0Z0Zpl/Z0Z0ZPZn/0Z0Z0Z0Z/Z0Z0ZKZ0",
        "solution": "1. Qd6+ Ke8 2. Ng7#"
    }
]

def convert_notation_to_fen(notation):
    """Chuyển board notation sang FEN"""
    piece_map = {
        'Z': '', '0': '',
        'O': 'P', 'M': 'N', 'A': 'B', 'S': 'R', 'L': 'B', 'J': 'K', 'Q': 'Q',
        'o': 'p', 'm': 'n', 'a': 'b', 's': 'r', 'l': 'b', 'j': 'k', 'q': 'q',
        'P': 'P', 'N': 'N', 'B': 'B', 'R': 'R', 'K': 'K',
        'p': 'p', 'n': 'n', 'b': 'b', 'r': 'r', 'k': 'k'
    }
    
    rows = notation.split('/')
    fen_rows = []
    
    for row in rows:
        fen_row = ''
        empty_count = 0
        
        for char in row:
            if char in ['Z', '0']:
                empty_count += 1
            else:
                if empty_count > 0:
                    fen_row += str(empty_count)
                    empty_count = 0
                piece = piece_map.get(char, '')
                if piece:
                    fen_row += piece
        
        if empty_count > 0:
            fen_row += str(empty_count)
        
        fen_rows.append(fen_row)
    
    return '/'.join(fen_rows) + ' w KQkq - 0 1'

def main():
    print("="*60)
    print("EXTRACT CHESS POSITIONS")
    print("="*60)
    
    # Convert data
    positions = []
    for item in sample_data:
        fen = convert_notation_to_fen(item['board_notation'])
        positions.append({
            'id': item['id'],
            'fen': fen,
            'solution': item['solution'],
            'difficulty': 'mate_in_2',
            'source': 'Ramakrishnan - Mate in Two',
            'tags': ['tactics', 'checkmate', 'puzzle'],
            'board_notation': item['board_notation']
        })
    
    # Save to JSON
    output_dir = Path('../output')
    output_dir.mkdir(exist_ok=True)
    
    json_path = output_dir / 'chess_positions.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(positions, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(positions)} positions to {json_path}")
    
    # Save to SQLite
    db_path = output_dir / 'chess_puzzles.db'
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Create table
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
    
    # Delete old data
    cursor.execute('DELETE FROM positions')
    
    # Insert new data
    for pos in positions:
        cursor.execute('''
        INSERT INTO positions (id, fen, solution, difficulty, source, tags, board_notation)
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
    
    print(f"✅ Saved {len(positions)} positions to {db_path}")
    
    # Copy to backend
    backend_db = Path('../backend/chess_puzzles.db')
    backend_db.parent.mkdir(exist_ok=True)
    
    import shutil
    shutil.copy(str(db_path), str(backend_db))
    print(f"✅ Copied database to {backend_db}")
    
    print("\n" + "="*60)
    print("✅ HOÀN THÀNH!")
    print("="*60)
    print("\n📋 Hiển thị 3 vị trí đầu:")
    for pos in positions[:3]:
        print(f"\n🔢 Position #{pos['id']}")
        print(f"   FEN: {pos['fen']}")
        print(f"   Giải: {pos['solution']}")

if __name__ == "__main__":
    main()