import { useState } from 'react';
import { Stats } from '../types/chess';

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    solved: 0,
    attempts: 0,
    successRate: 0
  });

  const incrementSolved = () => {
    setStats((prev: Stats) => ({
      ...prev,
      solved: prev.solved + 1,
      attempts: prev.attempts + 1,
      successRate: parseFloat(((prev.solved + 1) / (prev.attempts + 1) * 100).toFixed(1))
    }));
  };

  const incrementAttempts = () => {
    setStats((prev: Stats) => ({
      ...prev,
      attempts: prev.attempts + 1,
      successRate: parseFloat((prev.solved / (prev.attempts + 1) * 100).toFixed(1))
    }));
  };

  const resetStats = () => {
    setStats({
      solved: 0,
      attempts: 0,
      successRate: 0
    });
  };

  return {
    stats,
    incrementSolved,
    incrementAttempts,
    resetStats
  };
};