import { useState, useEffect } from 'react';

export const useResponsiveChessboardSize = () => {
  const [boardWidth, setBoardWidth] = useState(600);

  useEffect(() => {
    const updateBoardWidth = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 768) {
        // Mobile: use 90% of screen width, max 350px
        setBoardWidth(Math.min(width * 0.9, 350));
      } else if (width < 1024) {
        // Tablet: use 50% of screen width, max 450px
        setBoardWidth(Math.min(width * 0.5, 450));
      } else if (width < 1440) {
        // Small desktop: max 500px
        setBoardWidth(Math.min(width * 0.4, 500));
      } else {
        // Large desktop: max 600px
        setBoardWidth(Math.min(width * 0.35, 600));
      }
    };

    // Initial calculation
    updateBoardWidth();

    // Add resize listener
    window.addEventListener('resize', updateBoardWidth);
    
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  return boardWidth;
};