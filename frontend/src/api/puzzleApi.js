// src/api/puzzleApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const puzzleApi = {
  // Get random puzzle
  getRandomPuzzle: async () => {
    const response = await axios.get(`${API_BASE_URL}/positions/random`);
    return response.data;
  },

  // Get specific puzzle
  getPuzzle: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${id}`);
    return response.data;
  },

  // Get solution
  getSolution: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${id}/solution`);
    return response.data;
  },

  // Verify move
  verifyMove: async (id, move) => {
    const response = await axios.post(`${API_BASE_URL}/positions/${id}/verify`, {
      move: move
    });
    return response.data;
  },

  // Update progress
  updateProgress: async (userId, positionId, solved, timeSpent) => {
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/progress`, {
      position_id: positionId,
      solved: solved,
      time_spent: timeSpent
    });
    return response.data;
  },

  // Get user stats
  getUserStats: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`);
    return response.data;
  }
};