import json
import sqlite3
import os

print("=" * 60)
print("KIỂM TRA DỮ LIỆU CHESS PUZZLES")
print("=" * 60)

# Kiểm tra JSON
json_path = 'output/chess_positions.json'
if os.path.exists(json_path):
    print(f"\n✅ File JSON tồn tại: {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"   Số lượng positions: {len(data)}")
    
    # Hiển thị 3 vị trí đầu
    print("\n📋 3 VỊ TRÍ ĐẦU TIÊN:")
    for pos in data[:3]:
        print(f"\n   🔢 Position #{pos['id']}")
        print(f"      FEN: {pos['fen'][:50]}...")
        print(f"      Solution: {pos['solution']}")
else:
    print(f"\n❌ File JSON không tồn tại: {json_path}")

# Kiểm tra SQLite
db_path = 'output/chess_puzzles.db'
if os.path.exists(db_path):
    print(f"\n✅ File Database tồn tại: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Đếm số positions
    cursor.execute('SELECT COUNT(*) FROM positions')
    count = cursor.fetchone()[0]
    print(f"   Số lượng positions trong DB: {count}")
    
    # Lấy 3 positions đầu
    cursor.execute('SELECT id, fen, solution FROM positions LIMIT 3')
    rows = cursor.fetchall()
    
    print("\n📋 3 VỊ TRÍ ĐẦU TIÊN TRONG DB:")
    for row in rows:
        print(f"\n   🔢 Position #{row[0]}")
        print(f"      FEN: {row[1][:50]}...")
        print(f"      Solution: {row[2]}")
    
    conn.close()
else:
    print(f"\n❌ File Database không tồn tại: {db_path}")

print("\n" + "=" * 60)