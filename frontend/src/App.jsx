// src/App.jsx
import React, { useState, useEffect } from 'react';
import { puzzleApi } from './api/puzzleApi';

const App = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNewPuzzle = async () => {
    setLoading(true);
    try {
      const puzzle = await puzzleApi.getRandomPuzzle();
      setPosition(puzzle);
    } catch (error) {
      console.error('Error loading puzzle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (move) => {
    if (!position) return;
    
    try {
      const result = await puzzleApi.verifyMove(position.id, move);
      if (result.correct) {
        // Update progress
        await puzzleApi.updateProgress(1, position.id, true, timer);
        setMessage('🎉 Chính xác!');
      } else {
        setMessage('❌ Sai rồi!');
      }
    } catch (error) {
      console.error('Error verifying move:', error);
    }
  };

  // ... rest of component
};