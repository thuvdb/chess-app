import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Trophy, Clock, Target, Lightbulb, CheckCircle, XCircle, SkipForward } from 'lucide-react';

const ChessPuzzleApp = () => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    solved: 0,
    attempts: 0,
    successRate: 0
  });

  // Mock data (thay thế bằng API call thực tế)
  const samplePositions = [
    {
      id: 1,
      fen: "2n2k1/6p1/2b1p1B1/1p2P1b1/2p4P/2P5/2P5/5R1K w - - 0 1",
      solution: "1. h7+ Kh8 2. Rf8#",
      difficulty: "mate_in_2"
    },
    {
      id: 2,
      fen: "2b5/5p2/3L1p2/r3pP2/p3B3/1P2b3/P1P3PO/1KN4r w - - 0 1",
      solution: "1. b4+ Kb5 2. Bd3#",
      difficulty: "mate_in_2"
    },
    {
      id: 3,
      fen: "2r2r1s/3Q1pp1/p3b2p/4P1Pn/7P/pq6/N7/R1BRS3 w - - 0 1",
      solution: "1. Qxc8+ Bxc8 2. Rd8#",
      difficulty: "mate_in_2"
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(time => time + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Load new puzzle
  const loadNewPuzzle = () => {
    const randomPos = samplePositions[Math.floor(Math.random() * samplePositions.length)];
    setPosition(randomPos);
    
    const newGame = new Chess(randomPos.fen);
    setGame(newGame);
    
    setShowSolution(false);
    setMessage('Tìm nước đi chiếu hết trong 2 nước!');
    setIsCorrect(null);
    setTimer(0);
    setIsRunning(true);
  };

  // Handle piece drop
  const onDrop = (sourceSquare, targetSquare, piece) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      setGame(gameCopy);

      // Check if move is correct
      if (position && position.solution) {
        const firstMove = position.solution.split(' ')[1]; // "1. h7+" -> "h7+"
        const userMove = move.san;

        if (userMove === firstMove || userMove + '+' === firstMove) {
          setMessage('🎉 Chính xác! Đó là nước đi đầu tiên!');
          setIsCorrect(true);
          setIsRunning(false);
          setStats(prev => ({
            ...prev,
            solved: prev.solved + 1,
            attempts: prev.attempts + 1,
            successRate: ((prev.solved + 1) / (prev.attempts + 1) * 100).toFixed(1)
          }));
        } else {
          setMessage('❌ Không đúng! Thử lại nước khác.');
          setIsCorrect(false);
          setStats(prev => ({
            ...prev,
            attempts: prev.attempts + 1,
            successRate: (prev.solved / (prev.attempts + 1) * 100).toFixed(1)
          }));
          // Reset board after wrong move
          setTimeout(() => {
            setGame(new Chess(position.fen));
            setIsCorrect(null);
          }, 1500);
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Show hint
  const showHint = () => {
    if (position && position.solution) {
      const moves = position.solution.split(' ');
      setMessage(`💡 Gợi ý: Nước đi bắt đầu bằng quân ${moves[1][0].toUpperCase()}`);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initial load
  useEffect(() => {
    loadNewPuzzle();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            ♔ Chess Puzzle Master ♚
          </h1>
          <p className="text-purple-300">
            Luyện tập chiếu hết trong 2 nước - Ramakrishnan Collection
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} />
                Thống Kê
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Đã giải:</span>
                  <span className="text-2xl font-bold text-green-400">{stats.solved}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Tổng thử:</span>
                  <span className="text-2xl font-bold text-blue-400">{stats.attempts}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Tỷ lệ:</span>
                  <span className="text-2xl font-bold text-yellow-400">{stats.successRate}%</span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <Clock className="text-blue-400" size={24} />
                <span className="text-3xl font-mono font-bold text-white">
                  {formatTime(timer)}
                </span>
              </div>
            </div>

            {/* Puzzle Info */}
            {position && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="text-purple-400" size={20} />
                  Vị trí #{position.id}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Độ khó:</span>
                    <span className="text-white font-semibold">Mate in 2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">FEN:</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {position.fen.slice(0, 20)}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Solution */}
            {showSolution && position && (
              <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/50">
                <h3 className="text-lg font-bold text-green-300 mb-2">
                  🔓 Lời Giải
                </h3>
                <p className="text-white font-mono text-sm">
                  {position.solution}
                </p>
              </div>
            )}
          </div>

          {/* Center Panel - Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              
              {/* Message */}
              <div className={`mb-4 p-4 rounded-lg text-center font-semibold ${
                isCorrect === true ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                isCorrect === false ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/50'
              }`}>
                {message}
              </div>

              {/* Chessboard */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-2xl">
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  boardWidth={560}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#779952' }}
                  customLightSquareStyle={{ backgroundColor: '#edeed1' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={showHint}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  <Lightbulb size={20} />
                  Gợi Ý
                </button>

                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  {showSolution ? <XCircle size={20} /> : <CheckCircle size={20} />}
                  {showSolution ? 'Ẩn' : 'Xem'} Giải
                </button>

                <button
                  onClick={loadNewPuzzle}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  <SkipForward size={20} />
                  Bài Mới
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (position) {
                    setGame(new Chess(position.fen));
                    setIsCorrect(null);
                    setMessage('Thử lại! Tìm nước đi chiếu hết trong 2 nước!');
                  }
                }}
                className="w-full mt-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
              >
                🔄 Đặt Lại Bàn Cờ
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>💡 Kéo thả quân cờ để di chuyển • Tìm nước chiếu hết trong 2 nước</p>
          <p className="mt-2">Nguồn: Ramakrishnan - Mate in Two - All 4 Volumes (800 puzzles)</p>
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzleApp;