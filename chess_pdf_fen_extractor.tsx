import React, { useState } from 'react';
import { Upload, Database, Eye, Download } from 'lucide-react';

const ChessPDFFenExtractor = () => {
  const [fenData, setFenData] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Hàm chuyển đổi ký hiệu trong PDF sang FEN chuẩn
  const convertPDFNotationToFEN = (pdfNotation) => {
    // Mapping ký hiệu trong PDF sang FEN
    const pieceMap = {
      'Z': '1', // Empty square
      'P': 'P', 'N': 'N', 'B': 'B', 'R': 'R', 'Q': 'Q', 'K': 'K', // White pieces
      'p': 'p', 'n': 'n', 'b': 'b', 'r': 'r', 'q': 'q', 'k': 'k', // Black pieces (lowercase)
      'O': 'P', 'M': 'N', 'A': 'B', 'S': 'R', 'L': 'B', 'J': 'K', // White pieces (alternate notation)
      'o': 'p', 'm': 'n', 'a': 'b', 's': 'r', 'l': 'b', 'j': 'k'  // Black pieces (alternate notation)
    };

    let fen = '';
    let emptyCount = 0;

    for (let i = 0; i < pdfNotation.length; i++) {
      const char = pdfNotation[i];
      
      if (char === 'Z' || char === '0') {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += pieceMap[char] || char;
      }
    }
    
    if (emptyCount > 0) {
      fen += emptyCount;
    }

    return fen;
  };

  // Dữ liệu mẫu từ PDF (vị trí 1-10)
  const samplePositions = [
    {
      id: 1,
      board: "0Z0m0ZkZ/Z0Z0Z0o0/0ZbZpZBO/opZ0O0l0/0Zpo0Z0O/Z0O0Z0ZK/0ZPZ0Z0Z/Z0Z0ZRZ0",
      solution: "1. h7+ Kh8 2. Rf8#"
    },
    {
      id: 2,
      board: "0ZbZ0Z0Z/Z0Z0ZpZ0/0Z0L0o0Z/j0Z0oPZ0/pZ0ZBZ0Z/ZPZ0a0Z0/PZPZ0ZPO/ZKM0Z0l0",
      solution: "1. b4+ Kb5 2. Bd3#"
    },
    {
      id: 3,
      board: "0ZrZ0j0s/Z0ZQZpo0/pZ0ZbZ0o/Z0Z0ZPOn/0Z0Z0Z0O/oqZ0Z0Z0/NZ0Z0Z0Z/J0ARS0Z0",
      solution: "1. Qxc8+ Bxc8 2. Rd8#"
    },
    {
      id: 4,
      board: "0Z0Z0j0Z/o0Z0lro0/0Z0Z0Z0o/Z0Z0ZpZ0/0OQZnO0Z/ZBZRZ0Z0/PZ0Z0O0O/ZKZ0Z0Z0",
      solution: "1. Rd8+ Qxd8 2. Qxf7#"
    },
    {
      id: 5,
      board: "0Z0a0Z0j/Z0Z0ZbZ0/pZqA0m0Z/Z0O0Z0Lp/0Z0Z0Z0o/Z0Z0Z0O0/POBZ0Z0Z/J0Z0M0Z0",
      solution: "1. Qh6+ Kg8 2. Qf8#"
    }
  ];

  const parseFENFromBoard = (boardNotation) => {
    const rows = boardNotation.split('/');
    const fenRows = rows.map(row => convertPDFNotationToFEN(row));
    return fenRows.join('/') + ' w KQkq - 0 1';
  };

  const handleLoadSamples = () => {
    const parsed = samplePositions.map(pos => ({
      ...pos,
      fen: parseFENFromBoard(pos.board)
    }));
    setFenData(parsed);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(fenData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chess_positions.json';
    link.click();
  };

  const exportToSQL = () => {
    let sql = '-- Chess Positions Database\n\n';
    sql += 'CREATE TABLE IF NOT EXISTS positions (\n';
    sql += '  id INTEGER PRIMARY KEY,\n';
    sql += '  fen VARCHAR(100) NOT NULL,\n';
    sql += '  solution TEXT,\n';
    sql += '  difficulty VARCHAR(20) DEFAULT "mate_in_2"\n';
    sql += ');\n\n';
    
    fenData.forEach(pos => {
      sql += `INSERT INTO positions (id, fen, solution) VALUES (${pos.id}, '${pos.fen}', '${pos.solution}');\n`;
    });

    const dataBlob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chess_positions.sql';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Chess PDF FEN Extractor</h1>
            <p className="opacity-90">Trích xuất FEN từ sách cờ vua Ramakrishnan</p>
          </div>

          {/* Control Panel */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleLoadSamples}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Upload size={20} />
                Load Sample Data
              </button>
              
              <button
                onClick={exportToJSON}
                disabled={fenData.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                <Download size={20} />
                Export JSON
              </button>

              <button
                onClick={exportToSQL}
                disabled={fenData.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition"
              >
                <Database size={20} />
                Export SQL
              </button>
            </div>
          </div>

          {/* Stats */}
          {fenData.length > 0 && (
            <div className="p-6 bg-blue-50 border-b border-blue-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{fenData.length}</div>
                  <div className="text-sm text-gray-600">Vị trí đã trích xuất</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">800</div>
                  <div className="text-sm text-gray-600">Tổng số trong sách</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">2</div>
                  <div className="text-sm text-gray-600">Nước chiếu hết</div>
                </div>
              </div>
            </div>
          )}

          {/* Positions Grid */}
          <div className="p-6">
            {fenData.length === 0 ? (
              <div className="text-center py-16">
                <Upload size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-gray-500">
                  Nhấn "Load Sample Data" để xem ví dụ
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fenData.map((pos) => (
                  <div
                    key={pos.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedPosition(pos)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-700">
                        Vị trí #{pos.id}
                      </span>
                      <Eye size={20} className="text-blue-600" />
                    </div>
                    
                    <div className="bg-gray-100 rounded p-2 mb-3">
                      <code className="text-xs text-gray-700 break-all">
                        {pos.fen}
                      </code>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Giải pháp:</strong>
                      <div className="mt-1 text-green-600 font-mono">
                        {pos.solution}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Position Detail */}
          {selectedPosition && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Vị trí #{selectedPosition.id}
                  </h3>
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FEN Notation:
                    </label>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <code className="text-sm text-gray-800 break-all">
                        {selectedPosition.fen}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giải pháp:
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 font-mono">
                        {selectedPosition.solution}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Gợi ý:</strong> Bạn có thể sử dụng FEN này với thư viện chess.js 
                      hoặc stockfish để phân tích sâu hơn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessPDFFenExtractor;