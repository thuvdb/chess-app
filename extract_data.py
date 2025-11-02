"""
Extract Chess Positions - Chạy từ root directory
"""

import json
import sqlite3
import shutil
from pathlib import Path

# 10 vị trí mẫu
sample_data = [
    {"id": 1, "board": "2n2k1/6p1/2b1p1B1/1p2P1b1/2p4P/2P5/2P5/5R1K w - - 0 1", "solution": "1. h7+ Kh8 2. Rf8#"},
    {"id": 2, "board": "2b5/5p2/3L1p2/r3pP2/p3B3/1P2b3/P1P3PO/1KN4r w - - 0 1", "solution": "1. b4+ Kb5 2. Bd3#"},
    {"id": 3, "board": "2r2r1s/3Q1pp1/p3b2p/4P1Pn/7P/pq6/N7/R1BRS3 w - - 0 1", "solution": "1. Qxc8+ Bxc8 2. Rd8#"},
    {"id": 4, "board": "4r3/p3kpr1/8/8/5p2/1Q1n4/1P6/1K6 w - - 0 1", "solution": "1. Rd8+ Qxd8 2. Qxf7#"},
    {"id": 5, "board": "3r3r/5b2/p1qR1n2/2P3Lp/7p/6P1/P1B5/R3K3 w - - 0 1", "solution": "1. Qh6+ Kg8 2. Qf8#"},
    {"id": 6, "board": "r1n1q1nr/2p3k1/2P1p1pp/pP1pPp2/3P1P2/R5N1/4B2P/6K1 w - - 0 1", "solution": "1. Ng5+ hxg5 2. Rh3#"},
    {"id": 7, "board": "4r3/2k2ppB/pp6/8/3p4/1Pn5/P5PO/5R1K w - - 0 1", "solution": "1. Ba3+ Re7 2. Qxf7#"},
    {"id": 8, "board": "k6s/1p3p2/p5p1/4R2p/1P2Q1nP/6P1/P5B1/6K1 w - - 0 1", "solution": "1. Rd8+ Rxd8 2. Qxb7#"},
    {"id": 9, "board": "r6r/1Q4pp/1n3p2/1P6/p7/4R3/3P1PPO/1q3BK1 w - - 0 1", "solution": "1. Qxa8+ Nxa8 2. Re8#"},
    {"id": 10, "board": "1L6/1p2rp2/2p3p1/2P4N/1P4pl/5P1n/8/5K2 w - - 0 1", "solution": "1. Qd6+ Ke8 2. Ng7#"}
]

def main():
    print("="*60)
    print("EXTRACT CHESS POSITIONS")
    print("="*60)
    
    # Tạo thư mục
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    backend_dir = Path('backend')
    backend_dir.mkdir(exist_ok=True)
    
    # Chuẩn bị dữ liệu
    positions = []
    for item in sample_data:
        positions.append({
            'id': item['id'],
            'fen': item['board'],
            'solution': item['solution'],
            'difficulty': 'mate_in_2',
            'source': 'Ramakrishnan - Mate in Two',
            'tags': ['tactics', 'checkmate', 'puzzle']
        })
    
    # Save JSON
    json_path = output_dir / 'chess_positions.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(positions, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved {len(positions)} positions to: {json_path}")
    
    # Save SQLite
    db_path = output_dir / 'chess_puzzles.db'
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY,
        fen TEXT NOT NULL,
        solution TEXT,
        difficulty TEXT,
        source TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('DELETE FROM positions')
    
    for pos in positions:
        cursor.execute('''
        INSERT INTO positions (id, fen, solution, difficulty, source, tags)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            pos['id'],
            pos['fen'],
            pos['solution'],
            pos['difficulty'],
            pos['source'],
            ','.join(pos['tags'])
        ))
    
    conn.commit()
    conn.close()
    print(f"✅ Saved {len(positions)} positions to: {db_path}")
    
    # Copy to backend
    backend_db = backend_dir / 'chess_puzzles.db'
    shutil.copy(str(db_path), str(backend_db))
    print(f"✅ Copied database to: {backend_db}")
    
    print("\n" + "="*60)
    print("✅ HOÀN THÀNH!")
    print("="*60)

if __name__ == "__main__":
    main()