import { Target } from 'lucide-react';
import { PuzzlePosition, Player } from '../types/chess';
import { ChessUtils } from '../utils/chessUtils';
import { Chess } from 'chess.js';

interface PuzzleInfoProps {
  position: PuzzlePosition | null;
  currentPlayer: Player;
  game: Chess;
  showSolution: boolean;
}

export const PuzzleInfo = ({ position, currentPlayer, game, showSolution }: PuzzleInfoProps) => {
  if (!position) return null;

  return (
    <>
      {/* Puzzle Info */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: '800',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          <Target color="#a855f7" size={24} />
          Vị trí #{position.id}
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Lượt đi:</span>
            <span style={{
              fontWeight: '800',
              fontSize: '18px',
              color: currentPlayer === 'w' ? '#ffffff' : '#e5e7eb',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              {ChessUtils.getPlayerDisplayName(currentPlayer)} {currentPlayer === 'w' ? '⚪' : '⚫'}
            </span>
          </div>
          
          {ChessUtils.getGameStatus(game) && (
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>Trạng thái:</span>
              <span style={{
                color: '#ef4444',
                fontWeight: '800',
                fontSize: '18px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {ChessUtils.getGameStatus(game)}
              </span>
            </div>
          )}
          
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Độ khó:</span>
            <span style={{
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '18px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>Mate in 2</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>FEN:</span>
            <span style={{
              fontSize: '14px',
              color: '#d1d5db',
              fontFamily: 'monospace',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {position.fen ? position.fen.slice(0, 20) + '...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* Solution */}
      {showSolution && position && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#86efac',
            marginBottom: '16px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🔓 Lời Giải
          </h3>
          <p style={{
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: '600',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            {position.solution || 'Loading solution...'}
          </p>
        </div>
      )}
    </>
  );
};