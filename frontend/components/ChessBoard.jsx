// ChessBoard.jsx
import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function ChessExercise({ exercise }) {
  const [game, setGame] = useState(new Chess(exercise.fen));
  const [showSolution, setShowSolution] = useState(false);

  function onDrop(sourceSquare, targetSquare) {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        setGame(new Chess(game.fen()));
        
        // Kiểm tra đáp án
        if (move.from + move.to === exercise.solution) {
          alert('Chính xác! 🎉');
        }
      }
      
      return move !== null;
    } catch (error) {
      return false;
    }
  }

  return (
    <div className="exercise-container">
      <h3>{exercise.question}</h3>
      
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardWidth={500}
      />
      
      <button onClick={() => setShowSolution(!showSolution)}>
        {showSolution ? 'Ẩn' : 'Hiện'} đáp án
      </button>
      
      {showSolution && (
        <div className="solution">
          <p>Đáp án: {exercise.solution}</p>
          <p>{exercise.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default ChessExercise;