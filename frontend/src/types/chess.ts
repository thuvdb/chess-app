export interface Stats {
  solved: number;
  attempts: number;
  successRate: number;
}

export interface PuzzlePosition {
  id: string | number;
  fen: string;
  solution: string;
}

export interface MoveSquares {
  [key: string]: {
    background?: string;
    borderRadius?: string;
  };
}

export interface RightClickedSquares {
  [key: string]: {
    backgroundColor?: string;
  } | undefined;
}

export interface ParsedMove {
  piece: string;
  target: string;
  isCheck: boolean;
}

export type Player = 'w' | 'b';
export type PuzzleMode = 'random' | 'sequential';

export interface ChessSquareStyles {
  [key: string]: any;
}