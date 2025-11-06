import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { ChevronDown } from 'lucide-react';

// Import types
import { MoveSquares, RightClickedSquares } from '../types/chess';

// Import utilities
import { ChessUtils } from '../utils/chessUtils';
import { PuzzleAPI } from '../services/puzzleAPI';

// Import hooks
import { useTimer } from '../hooks/useTimer';
import { useStats } from '../hooks/useStats';
import { usePuzzle } from '../hooks/usePuzzle';

// Import components
import { StatsPanel } from './StatsPanel';
import { PuzzleInfo } from './PuzzleInfo';
import { ActionButtons } from './ActionButtons';

const ChessPuzzleApp = () => {
  // Hooks
  const { timer, startTimer, stopTimer, resetTimer } = useTimer();
  const { stats, incrementSolved, incrementAttempts } = useStats();
  const {
    game,
    setGame,
    position,
    currentPlayer,
    setCurrentPlayer,
    puzzleMode,
    setPuzzleMode,
    currentPuzzleIndex,
    totalPuzzles,
    freePlayMode,
    setFreePlayMode,
    solutionMoveIndex,
    setSolutionMoveIndex,
    moveCount,
    setMoveCount,
    loadNewPuzzle,
    loadPuzzleByIndex,
    loadTotalPuzzles,
    resetToInitialPosition,
    goToPreviousPuzzle,
    goToNextPuzzle
  } = usePuzzle();

  // Local state
  const [showSolution, setShowSolution] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [moveSquares, setMoveSquares] = useState<MoveSquares>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<RightClickedSquares>({});
  const [showPagination, setShowPagination] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w'); // Player's color
  const [computerColor, setComputerColor] = useState<'w' | 'b'>('b'); // Computer's color
  const [isComputerThinking, setIsComputerThinking] = useState(false); // Prevent multiple computer moves
  const [isGameOver, setIsGameOver] = useState(false); // Track if game is over due to move limit
  const [gameHistory, setGameHistory] = useState<string[]>([]); // Store FEN history for undo

  // Initialize player and computer colors based on who moves first
  useEffect(() => {
    if (position?.fen) {
      const currentTurn = ChessUtils.getCurrentPlayerFromFEN(position.fen);
      // Player gets the color that moves first
      const playerCol = currentTurn; // currentTurn is already 'w' or 'b'
      const computerCol = playerCol === 'w' ? 'b' : 'w';
      
      setPlayerColor(playerCol);
      setComputerColor(computerCol);
      
      // Initialize game history with starting position
      setGameHistory([position.fen]);
      
      console.log('🎯 Color assignment:', { 
        position: position.id, 
        firstToMove: currentTurn === 'w' ? 'white' : 'black',
        playerColor: playerCol, 
        computerColor: computerCol 
      });
    }
  }, [position?.fen, position?.id]);

  // Auto-play computer moves in constraint mode only  
  const autoPlayComputerMove = useCallback(async () => {
    console.log('🤖 Computer making a move...');
    
    // Only auto-play in constraint mode, not in free play mode
    if (freePlayMode || !position || moveCount >= 4) {
      console.log('❌ Computer auto-play stopped:', { freePlayMode, position: !!position, moveCount });
      return;
    }
    
    // In constraint mode, only move if it's computer's turn
    if (game.turn() !== computerColor) {
      console.log('❌ Not computer turn, current turn:', game.turn(), 'computer color:', computerColor);
      return;
    }
    
    // Prevent multiple simultaneous computer moves
    if (isComputerThinking) {
      console.log('❌ Computer already thinking...');
      return;
    }
    
    setIsComputerThinking(true);
    
    try {
      const currentGameCopy = new Chess(game.fen());
      console.log('🤖 Current FEN before computer move:', game.fen());
      
      // Get all legal moves
      const allMoves = currentGameCopy.moves({ verbose: true });
      console.log('🤖 All legal moves:', allMoves.length);
      
      // Filter moves for computer's color only
      const computerMoves = allMoves.filter(move => {
        const piece = currentGameCopy.get(move.from);
        return piece && piece.color === computerColor;
      });
      
      console.log('🤖 Computer legal moves:', computerMoves.length, 'for color:', computerColor);
      
      if (computerMoves.length === 0) {
        console.log('🤖 No legal moves for computer color:', computerColor);
        setMessage('❌ Computer không có nước đi hợp lệ');
        setIsComputerThinking(false);
        return;
      }
      
      // Add 3 second thinking delay
      setMessage('🤖 Computer đang suy nghĩ...');
      
      setTimeout(() => {
        // Create a fresh game copy for the actual move (to avoid board jumping)
        const freshGameCopy = new Chess(game.fen());
        const randomMove = computerMoves[Math.floor(Math.random() * computerMoves.length)];
        console.log('🤖 Computer chose:', randomMove);
        
        const move = freshGameCopy.move(randomMove);
        if (move) {
          setGame(freshGameCopy);
          setCurrentPlayer(ChessUtils.getCurrentPlayerFromFEN(freshGameCopy.fen()));
          setMoveCount((prev: number) => prev + 1);
          
          // Save to history for undo functionality
          setGameHistory(prev => [...prev, freshGameCopy.fen()]);
          
          setMessage(`🤖 Máy đi: ${move.san}. Lượt của bạn! (${Math.floor((moveCount + 1) / 2) + 1}/2)`);
          
          // Check if computer achieves checkmate
          if (freshGameCopy.isCheckmate()) {
            setMessage('😔 Máy tính chiếu hết! Bạn đã thua. Chơi lại!');
            setIsCorrect(false);
            stopTimer();
            incrementAttempts();
            setIsComputerThinking(false);
            return;
          }
          
          // Only declare game over after both sides have had 2 moves each
          if (moveCount + 1 >= 4) {
            setMessage('⏰ Hết 2 nước! Không ai chiếu hết được. Chơi lại!');
            setIsCorrect(false);
            setIsGameOver(true);
            stopTimer();
            incrementAttempts();
          }
        }
        setIsComputerThinking(false);
      }, 3000); // 3 second thinking time
    } catch (error) {
      console.error('🤖 Computer move error:', error);
      setMessage('❌ Computer không thể di chuyển');
      setIsComputerThinking(false);
    }
  }, [position, freePlayMode, moveCount, game, computerColor, stopTimer, incrementAttempts, isComputerThinking]);

  // Trigger computer move when it's computer's turn in constraint mode
  useEffect(() => {
    if (!freePlayMode && game && !game.isGameOver() && game.turn() === computerColor && moveCount < 4 && !isComputerThinking && !isGameOver) {
      const timer = setTimeout(() => {
        autoPlayComputerMove();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [game, freePlayMode, computerColor, moveCount, autoPlayComputerMove, isComputerThinking, isGameOver]);

  // Handle piece drop - Updated logic for constraint mode vs free mode
  const onDrop = useCallback((sourceSquare: any, targetSquare: any, piece: any): boolean => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) {
        setMessage('❌ Nước đi không hợp lệ theo luật cờ vua! Thử lại.');
        return false;
      }

      setGame(gameCopy);
      setMoveSquares({});
      setSelectedSquare(null);

      // Save to history for undo functionality
      setGameHistory(prev => [...prev, gameCopy.fen()]);

      // Handle free play mode (unlimited moves)
      if (freePlayMode) {
        if (gameCopy.isCheckmate()) {
          setMessage('🏆 Chiếu hết! Puzzle hoàn thành!');
          setIsCorrect(true);
          stopTimer();
          incrementSolved();
        } else if (gameCopy.isCheck()) {
          setMessage('⚠️ Chiếu Vua! Tiếp tục để hoàn thành mate in 2.');
        } else {
          const newCurrentPlayer = ChessUtils.getCurrentPlayerFromFEN(gameCopy.fen());
          setCurrentPlayer(newCurrentPlayer);
          setMessage(`Di chuyển thành công. Lượt của ${ChessUtils.getPlayerDisplayName(newCurrentPlayer)}.`);
        }
        return true;
      }

      // Handle constraint mode (2 moves per side max)
      if (!position) {
        setMessage('❌ Không tìm thấy puzzle.');
        return false;
      }

      // Only block if we've reached the limit (4 moves total) or game is over
      if (moveCount >= 4 || isGameOver) {
        setMessage('⏰ Đã hết 2 nước cho mỗi bên!');
        return false;
      }

      const newMoveCount = moveCount + 1;
      setMoveCount(newMoveCount);
      const newCurrentPlayer = ChessUtils.getCurrentPlayerFromFEN(gameCopy.fen());
      setCurrentPlayer(newCurrentPlayer);

      // Check for checkmate
      if (gameCopy.isCheckmate()) {
        setMessage('🎉 Chiếu hết! Bạn đã thắng trong mate-in-2!');
        setIsCorrect(true);
        stopTimer();
        incrementSolved();
        return true;
      }

      // Don't end game yet - let computer have its turn
      // Only player moves end in onDrop, computer moves are handled separately
      setMessage(`Di chuyển thành công. Lượt của ${ChessUtils.getPlayerDisplayName(newCurrentPlayer)}. (${Math.floor(newMoveCount / 2) + 1}/2)`);
      
      // Schedule computer move for next tick (only in constraint mode)
      if (newMoveCount < 4) {
        setTimeout(() => {
          // Auto-play computer move logic will be handled by useEffect
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Error making move:', error);
      setMessage('❌ Lỗi thực hiện nước đi.');
      return false;
    }
  }, [game, freePlayMode, position, moveCount, stopTimer, incrementSolved, incrementAttempts]);

  // Handle square click for move highlighting and piece selection
  const onSquareClick = useCallback((square: string) => {
    setRightClickedSquares({});
    
    // Block interaction if game is over
    if (isGameOver) {
      setMessage('⏰ Game đã kết thúc! Nhấn "Thử lại" để chơi tiếp.');
      return;
    }
    
    // In constraint mode, only allow player to move their own pieces when it's their turn
    if (!freePlayMode && game.turn() !== playerColor) {
      setMessage('⏰ Đang chờ computer di chuyển...');
      return;
    }
    
    // If a square is already selected, try to make a move
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Clicking same square - deselect
        setSelectedSquare(null);
        setMoveSquares({});
        return;
      }
      
      // Try to make a move from selectedSquare to clicked square
      const gameCopy = new Chess(game.fen());
      try {
        const move = gameCopy.move({
          from: selectedSquare as any,
          to: square as any,
          promotion: 'q'
        });
        
        if (move) {
          // Valid move - will be handled by onDrop
          const result = onDrop(selectedSquare, square, null);
          if (result) {
            setSelectedSquare(null);
            setMoveSquares({});
          }
        } else {
          // Invalid move - try selecting new piece
          const piece = game.get(square as any);
          if (piece && piece.color === (freePlayMode ? game.turn() : playerColor)) {
            setSelectedSquare(square);
            const highlights = ChessUtils.generateMoveHighlights(game, square);
            setMoveSquares(highlights);
          } else {
            setSelectedSquare(null);
            setMoveSquares({});
          }
        }
      } catch (error) {
        setSelectedSquare(null);
        setMoveSquares({});
      }
    } else {
      // No square selected - try to select piece
      const piece = game.get(square as any);
      if (piece && piece.color === (freePlayMode ? game.turn() : playerColor)) {
        setSelectedSquare(square);
        const highlights = ChessUtils.generateMoveHighlights(game, square);
        setMoveSquares(highlights);
      }
    }
  }, [game, selectedSquare, freePlayMode, playerColor, onDrop, isGameOver]);

  // Get King highlight styles for check/checkmate
  const getKingHighlightStyles = useCallback(() => {
    if (!game) return {};
    
    const styles: { [key: string]: any } = {};
    
    if (game.isCheck()) {
      // Find the king in check
      const currentPlayer = game.turn();
      const board = game.board();
      
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece && piece.type === 'k' && piece.color === currentPlayer) {
            const square = String.fromCharCode(97 + j) + (8 - i);
            if (game.isCheckmate()) {
              // Gray highlight for checkmate
              styles[square] = {
                backgroundColor: 'rgba(128, 128, 128, 0.8)',
                border: '3px solid #666666'
              };
            } else {
              // Red highlight for check
              styles[square] = {
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                border: '3px solid #dc2626'
              };
            }
            break;
          }
        }
      }
    }
    
    return styles;
  }, [game]);

  // Handle right-click for annotations
  const onSquareRightClick = useCallback((square: string) => {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares((prev) => ({
      ...prev,
      [square]: prev[square] && prev[square]?.backgroundColor === colour ? undefined : { backgroundColor: colour },
    }));
  }, []);

  // Show hint
  const showHint = useCallback(async () => {
    if (position?.id) {
      try {
        const solution = await PuzzleAPI.getPuzzleSolution(position.id);
        const moves = solution.split(' ');
        let firstMove = '';
        
        for (const move of moves) {
          if (!move.endsWith('.')) {
            firstMove = move;
            break;
          }
        }
        
        const moveInfo = ChessUtils.parseMoveNotation(firstMove);
        
        let hintText = '💡 Gợi ý: ';
        hintText += `Di chuyển ${moveInfo.piece}`;
        
        if (moveInfo.target) {
          hintText += ` đến ô ${moveInfo.target.toUpperCase()}`;
        }
        
        if (moveInfo.isCheck) {
          hintText += ' (Chiếu!)';
        }
        
        setMessage(hintText);
      } catch (error) {
        console.error('Error fetching hint:', error);
        setMessage('❌ Không thể tải gợi ý.');
      }
    }
  }, [position]);

  // Toggle solution display
  const toggleSolution = useCallback(async () => {
    if (!showSolution && position?.id) {
      try {
        const solution = await PuzzleAPI.getPuzzleSolution(position.id);
        setMessage(`🔓 Lời giải: ${solution}`);
        setShowSolution(true);
      } catch (error) {
        console.error('Error fetching solution:', error);
        setMessage('❌ Lỗi tải lời giải.');
      }
    } else {
      setShowSolution(false);
      setMessage('Tìm nước đi chiếu hết trong 2 nước!');
    }
  }, [showSolution, position]);

  // Handle undo last move
  const handleUndo = useCallback(() => {
    if (gameHistory.length < 2) {
      setMessage('❌ Không có nước đi nào để hoàn tác!');
      return;
    }

    // In constraint mode, undo both player and computer moves (go back 2 steps)
    if (!freePlayMode && gameHistory.length >= 2) {
      const targetHistoryLength = Math.max(1, gameHistory.length - 2);
      const targetFen = gameHistory[targetHistoryLength - 1];
      
      // Update game state
      const newGame = new Chess(targetFen);
      setGame(newGame);
      setCurrentPlayer(ChessUtils.getCurrentPlayerFromFEN(targetFen));
      
      // Update move count (subtract 2 for both player and computer moves)
      const newMoveCount = Math.max(0, moveCount - 2);
      setMoveCount(newMoveCount);
      
      // Update history
      setGameHistory(prev => prev.slice(0, targetHistoryLength));
      
      // Clear selection and highlights
      setSelectedSquare(null);
      setMoveSquares({});
      setIsGameOver(false);
      setIsCorrect(null);
      
      setMessage('↩️ Đã hoàn tác 2 nước đi (bạn và máy tính)');
    } else if (freePlayMode && gameHistory.length >= 1) {
      // In free play mode, undo just the last move
      const targetFen = gameHistory[gameHistory.length - 2];
      
      const newGame = new Chess(targetFen);
      setGame(newGame);
      setCurrentPlayer(ChessUtils.getCurrentPlayerFromFEN(targetFen));
      
      // Update history
      setGameHistory(prev => prev.slice(0, -1));
      
      // Clear selection and highlights
      setSelectedSquare(null);
      setMoveSquares({});
      setIsCorrect(null);
      
      setMessage('↩️ Đã hoàn tác nước đi cuối');
    }
  }, [gameHistory, moveCount, freePlayMode]);

  // Handle new puzzle loading
  const handleNewPuzzle = useCallback(async () => {
    setMessage('🔄 Đang tải puzzle mới...');
    const result = await loadNewPuzzle();
    setMessage(result.message);
    setShowSolution(false);
    setIsCorrect(null);
    setIsGameOver(false);
    setGameHistory([]); // Reset history for new puzzle
    resetTimer();
    startTimer();
  }, [loadNewPuzzle, resetTimer, startTimer]);

  // Handle board reset
  const handleResetBoard = useCallback(() => {
    resetToInitialPosition();
    setIsCorrect(null);
    setSelectedSquare(null);
    setMoveSquares({});
    setIsGameOver(false);
    
    // Reset game history to initial position
    if (position?.fen) {
      setGameHistory([position.fen]);
    }
    
    setMessage(`Thử lại! ${freePlayMode ? 'Chế độ tự do' : 'Chế độ ràng buộc: Mỗi bên chỉ 2 nước'} - Tìm nước đi chiếu hết!`);
  }, [resetToInitialPosition, freePlayMode, position?.fen]);

  // Handle puzzle navigation
  const handlePuzzleNavigation = useCallback(async (direction: 'prev' | 'next') => {
    const result = direction === 'prev' ? await goToPreviousPuzzle() : await goToNextPuzzle();
    if (result.success) {
      setMessage(result.message);
      setShowSolution(false);
      setIsCorrect(null);
      setIsGameOver(false);
      setGameHistory([]); // Reset history for new puzzle
      resetTimer();
      startTimer();
    }
  }, [goToPreviousPuzzle, goToNextPuzzle, resetTimer, startTimer]);

  // Initial load
  useEffect(() => {
    const initializeApp = async () => {
      await loadTotalPuzzles();
      await handleNewPuzzle();
    };
    initializeApp();
  }, []);

  return (
    <div style={{
      width: '100vw', 
      minHeight: '100vh', 
      margin: 0, 
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }} className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div style={{
        width: '100%', 
        maxWidth: '1400px',
        padding: '20px',
        margin: '0 auto'
      }}>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              ♔ Chess Puzzle Master ♚
            </h1>
            <p className="text-purple-300 text-xl">
              Luyện tập chiếu hết trong 2 nước - Ramakrishnan Collection
            </p>
          </div>

          {/* Main Layout - Change to 2 column layout for bigger chess board */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            <StatsPanel stats={stats} timer={timer} />

            {/* Mode Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">⚙️ Chế Độ Chơi</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freePlayMode}
                      onChange={(e) => setFreePlayMode(e.target.checked)}
                      className="text-green-500 w-5 h-5"
                    />
                    <span className="text-white text-lg">🎮 Chế độ tự do (không giới hạn nước)</span>
                  </label>
                  <div className="text-sm text-purple-300 mt-1 ml-8">
                    {freePlayMode ? 'Chơi tự do, không giới hạn số nước đi' : 'Chế độ ràng buộc: Mỗi bên chỉ được 2 nước'}
                  </div>
                </div>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#ffffff',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    <input
                      type="radio"
                      name="puzzleMode"
                      value="random"
                      checked={puzzleMode === 'random'}
                      onChange={(e) => setPuzzleMode(e.target.value as any)}
                      style={{width: '20px', height: '20px', accentColor: '#8b5cf6'}}
                    />
                    <span>🎲 Ngẫu nhiên</span>
                  </label>
                </div>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#ffffff',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    <input
                      type="radio"
                      name="puzzleMode"
                      value="sequential"
                      checked={puzzleMode === 'sequential'}
                      onChange={(e) => {
                        setPuzzleMode(e.target.value as any);
                        setShowPagination(true);
                      }}
                      style={{width: '20px', height: '20px', accentColor: '#f59e0b'}}
                    />
                    <span>📚 Theo thứ tự (phân trang)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pagination for sequential mode */}
            {puzzleMode === 'sequential' && showPagination && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📖 Chọn Trang (6 bài/trang)</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        setCurrentPage(page);
                        const startIndex = (page - 1) * 6;
                        loadPuzzleByIndex(startIndex);
                      }}
                      className="w-full px-4 py-3 text-lg bg-gray-800 text-white rounded-xl border-2 border-gray-600 focus:border-purple-400 focus:outline-none hover:border-purple-300 transition-colors font-medium"
                    >
                      {Array.from({ length: Math.ceil(totalPuzzles / 6) }, (_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-gray-800 text-white py-2">
                          Trang {i + 1} (Bài {i * 6 + 1}-{Math.min((i + 1) * 6, totalPuzzles)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }, (_, i) => {
                      const puzzleIndex = (currentPage - 1) * 6 + i;
                      if (puzzleIndex >= totalPuzzles) return null;
                      
                      return (
                        <button
                          key={puzzleIndex}
                          onClick={() => loadPuzzleByIndex(puzzleIndex)}
                          className={`px-2 py-1 text-xs rounded ${
                            puzzleIndex === currentPuzzleIndex
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {puzzleIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="text-center text-sm text-purple-200">
                    Bài {currentPuzzleIndex + 1} / {totalPuzzles}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation for sequential mode */}
            {puzzleMode === 'sequential' && !showPagination && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🧭 Điều hướng</h3>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => handlePuzzleNavigation('prev')}
                    disabled={currentPuzzleIndex <= 0}
                    className="flex-1 px-4 py-3 text-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => handlePuzzleNavigation('next')}
                    disabled={currentPuzzleIndex >= totalPuzzles - 1}
                    className="flex-1 px-4 py-3 text-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                  >
                    Sau →
                  </button>
                </div>
                <div className="text-center text-sm text-purple-200">
                  {currentPuzzleIndex + 1} / {totalPuzzles}
                </div>
              </div>
            )}

            <PuzzleInfo 
              position={position} 
              currentPlayer={currentPlayer} 
              game={game} 
              showSolution={showSolution} 
            />
          </div>

          {/* Center Panel - Chessboard and Action Buttons */}
          <div className="lg:col-span-3">
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '32px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)'
            }}>
              
              {/* Message */}
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: '700',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }} className={
                isCorrect === true ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                isCorrect === false ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                'bg-blue-500/20 text-blue-300 border-blue-500/50'
              }>
                {message}
              </div>

              {/* Chessboard and Action Buttons Layout */}
              <div style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}>
                
                {/* Chessboard Container */}
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }} className="">
                  <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    boardWidth={700}
                    boardOrientation="white"
                    customBoardStyle={{
                      borderRadius: '16px',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
                      border: '4px solid rgba(255, 255, 255, 0.4)',
                    }}
                    customDarkSquareStyle={{ 
                      backgroundColor: isGameOver ? '#888888' : '#769656' 
                    }}
                    customLightSquareStyle={{ 
                      backgroundColor: isGameOver ? '#bbbbbb' : '#eeeed2' 
                    }}
                    customSquareStyles={{
                      ...moveSquares,
                      ...rightClickedSquares,
                      ...getKingHighlightStyles(),
                      ...(selectedSquare && {
                        [selectedSquare]: {
                          backgroundColor: 'rgba(255, 255, 0, 0.5)',
                          borderRadius: '50%',
                          border: '3px solid #fbbf24'
                        }
                      })
                    }}
                    arePiecesDraggable={!isGameOver}
                    areArrowsAllowed={true}
                  />
                </div>

                {/* Action Buttons Panel */}
                <div style={{
                  minWidth: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <ActionButtons
                    onShowHint={showHint}
                    onToggleSolution={toggleSolution}
                    onNewPuzzle={handleNewPuzzle}
                    onResetBoard={handleResetBoard}
                    onUndo={handleUndo}
                    showSolution={showSolution}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>💡 Kéo thả quân cờ để di chuyển • Tìm nước chiếu hết trong 2 nước</p>
          <p className="mt-2">Nguồn: Ramakrishnan - Mate in Two - All 4 Volumes (800 puzzles) --- Copyright © 2025 Bapkute. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ChessPuzzleApp;