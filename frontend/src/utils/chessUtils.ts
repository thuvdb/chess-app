import { Chess } from 'chess.js';
import { ParsedMove, Player } from '../types/chess';

export class ChessUtils {
  // Get current player from FEN string
  static getCurrentPlayerFromFEN(fen: string): Player {
    if (!fen) return 'w';
    const fenParts = fen.split(' ');
    return (fenParts[1] as Player) || 'w';
  }

  // Get piece display name in Vietnamese
  static getPieceDisplayName(piece: string): string {
    const pieceMap: { [key: string]: string } = {
      'K': 'Vua',
      'Q': 'Hậu', 
      'R': 'Xe',
      'B': 'Tượng', 
      'N': 'Mã',
      'P': 'Tốt'
    };
    
    return pieceMap[piece] || piece;
  }

  // Get player display name in Vietnamese
  static getPlayerDisplayName(player: Player): string {
    return player === 'w' ? 'Trắng' : 'Đen';
  }

  // Parse move notation for hints
  static parseMoveNotation(move: string): ParsedMove {
    if (!move) return { piece: '', target: '', isCheck: false };
    
    const isCheck = move.includes('+') || move.includes('#');
    const cleanMove = move.replace(/[+#]/, '');
    
    // Parse piece type
    let piece = '';
    if (cleanMove.match(/^K/)) {
      piece = 'Vua';
    } else if (cleanMove.match(/^Q/)) {
      piece = 'Hậu';
    } else if (cleanMove.match(/^R/)) {
      piece = 'Xe';
    } else if (cleanMove.match(/^B/)) {
      piece = 'Tượng';
    } else if (cleanMove.match(/^N/)) {
      piece = 'Mã';
    } else if (cleanMove.match(/^[a-h]/)) {
      piece = 'Tốt';
    }
    
    // Parse target square
    const targetMatch = cleanMove.match(/[a-h][1-8]$/);
    const target = targetMatch ? targetMatch[0] : '';
    
    return { piece, target, isCheck };
  }

  // Get game status in Vietnamese
  static getGameStatus(game: Chess): string {
    if (!game) return '';
    
    if (game.isCheckmate()) {
      return '♟️ Chiếu hết!';
    } else if (game.isCheck()) {
      return '⚠️ Chiếu Vua!';
    } else if (game.isStalemate()) {
      return '🤝 Hòa cờ (Stalemate)';
    } else if (game.isDraw()) {
      return '🤝 Hòa cờ';
    }
    
    return '';
  }

  // Parse solution string into moves array
  static parseSolution(solution: string): string[] {
    if (!solution) return [];
    
    console.log('📝 Raw solution:', solution);
    
    // Remove move numbers and extra spaces
    const moves = solution
      .replace(/\d+\.\.\./g, '') // Remove "1..." 
      .replace(/\d+\./g, '')     // Remove "1."
      .replace(/Checkmate/g, '')  // Remove "Checkmate"
      .replace(/1-0|0-1/g, '')   // Remove game results
      .trim()
      .split(/\s+/)
      .filter(move => move.length > 0);
    
    console.log('📝 Parsed moves:', moves);
    return moves;
  }

  // Format time display
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Generate move highlights for possible moves
  static generateMoveHighlights(game: Chess, square: string): { [key: string]: any } {
    const piece = game.get(square as any);
    if (!piece || piece.color !== game.turn()) {
      return {};
    }

    const moves = game.moves({
      square: square as any,
      verbose: true,
    });
    
    if (moves.length === 0) return {};
    
    const newSquares: { [key: string]: any } = {};
    moves.forEach((move: any) => {
      const targetPiece = game.get(move.to);
      newSquares[move.to] = {
        background:
          targetPiece && targetPiece.color !== piece.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    
    return newSquares;
  }
}