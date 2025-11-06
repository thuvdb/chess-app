import React from 'react';
import ReactDOM from 'react-dom/client';
import ChessPuzzleApp from './components/ChessPuzzleAppRefactored.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChessPuzzleApp />
  </React.StrictMode>
);