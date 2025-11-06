import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { PuzzlePosition, Player, PuzzleMode } from '../types/chess';
import { PuzzleAPI } from '../services/puzzleAPI';
import { ChessUtils } from '../utils/chessUtils';

export const usePuzzle = () => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState<PuzzlePosition | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('w');
  const [puzzleMode, setPuzzleMode] = useState<PuzzleMode>('random');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [freePlayMode, setFreePlayMode] = useState(false);
  const [solutionMoveIndex, setSolutionMoveIndex] = useState(0);
  const [moveCount, setMoveCount] = useState(0);

  // Load puzzle by index
  const loadPuzzleByIndex = useCallback(async (index: number) => {
    try {
      const data = await PuzzleAPI.getPuzzleByIndex(index);
      setPosition(data);
      setCurrentPuzzleIndex(index);
      setSolutionMoveIndex(0);
      setMoveCount(0);
      
      const newGame = new Chess(data.fen);
      setGame(newGame);
      
      const currentPlayer = ChessUtils.getCurrentPlayerFromFEN(data.fen);
      setCurrentPlayer(currentPlayer);
      
      return { success: true, message: `Tìm nước đi chiếu hết trong 2 nước! (Puzzle ${index + 1}/${totalPuzzles})` };
    } catch (error: any) {
      return { success: false, message: error.message || 'Lỗi kết nối đến server.' };
    }
  }, [totalPuzzles]);

  // Load new puzzle
  const loadNewPuzzle = useCallback(async () => {
    try {
      if (puzzleMode === 'sequential') {
        const randomIndex = Math.floor(Math.random() * totalPuzzles);
        return await loadPuzzleByIndex(randomIndex);
      } else {
        const data = await PuzzleAPI.getRandomPuzzle();
        setPosition(data);
        setSolutionMoveIndex(0);
        setMoveCount(0);
        
        const newGame = new Chess(data.fen);
        setGame(newGame);
        
        const currentPlayer = ChessUtils.getCurrentPlayerFromFEN(data.fen);
        setCurrentPlayer(currentPlayer);
        
        return { success: true, message: 'Tìm nước đi chiếu hết trong 2 nước!' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Lỗi kết nối đến server.' };
    }
  }, [puzzleMode, totalPuzzles, loadPuzzleByIndex]);

  // Load total puzzles count
  const loadTotalPuzzles = useCallback(async () => {
    try {
      const count = await PuzzleAPI.getTotalPuzzles();
      setTotalPuzzles(count);
    } catch (error) {
      console.error('Error loading puzzle count:', error);
    }
  }, []);

  // Reset to initial position
  const resetToInitialPosition = useCallback(() => {
    if (position) {
      const newGame = new Chess(position.fen);
      setGame(newGame);
      setCurrentPlayer(ChessUtils.getCurrentPlayerFromFEN(position.fen));
      setSolutionMoveIndex(0);
      setMoveCount(0);
    }
  }, [position]);

  // Navigation functions
  const goToPreviousPuzzle = useCallback(() => {
    if (currentPuzzleIndex > 0) {
      return loadPuzzleByIndex(currentPuzzleIndex - 1);
    }
    return Promise.resolve({ success: false, message: 'Đã ở puzzle đầu tiên' });
  }, [currentPuzzleIndex, loadPuzzleByIndex]);

  const goToNextPuzzle = useCallback(() => {
    if (currentPuzzleIndex < totalPuzzles - 1) {
      return loadPuzzleByIndex(currentPuzzleIndex + 1);
    }
    return Promise.resolve({ success: false, message: 'Đã ở puzzle cuối cùng' });
  }, [currentPuzzleIndex, totalPuzzles, loadPuzzleByIndex]);

  return {
    // State
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
    
    // Actions
    loadNewPuzzle,
    loadPuzzleByIndex,
    loadTotalPuzzles,
    resetToInitialPosition,
    goToPreviousPuzzle,
    goToNextPuzzle
  };
};