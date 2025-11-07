import { PuzzlePosition } from '../types/chess';

// export const API_BASE_URL = 'http://localhost:5000/api';
export const API_BASE_URL = 'https://chess-app-backend-cagt.onrender.com/api'; 

export class PuzzleAPI {
  // Get random puzzle
  static async getRandomPuzzle(): Promise<PuzzlePosition> {
    const response = await fetch(`${API_BASE_URL}/positions/random`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error('Không thể tải puzzle. Kiểm tra kết nối API.');
    }

    if (!data.fen) {
      throw new Error('Dữ liệu puzzle không hợp lệ.');
    }

    return data;
  }

  // Get puzzle by index
  static async getPuzzleByIndex(index: number): Promise<PuzzlePosition> {
    const response = await fetch(`${API_BASE_URL}/positions/by-index/${index}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error('Không thể tải puzzle. Kiểm tra kết nối API.');
    }

    return data;
  }

  // Get total puzzle count
  static async getTotalPuzzles(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/positions/count`);
    const data = await response.json();
    return data.total || 0;
  }

  // Get puzzle solution
  static async getPuzzleSolution(puzzleId: string | number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/positions/${puzzleId}/solution`);
    const data = await response.json();
    
    if (data.solution) {
      return data.solution;
    }
    
    throw new Error('Không thể tải lời giải.');
  }
}
