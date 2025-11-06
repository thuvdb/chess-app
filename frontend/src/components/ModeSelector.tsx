import { ChevronDown } from 'lucide-react';
import { PuzzleMode } from '../types/chess';
import { useState, useEffect, useRef } from 'react';

interface ModeSelectorProps {
  freePlayMode: boolean;
  setFreePlayMode: (value: boolean) => void;
  puzzleMode: PuzzleMode;
  setPuzzleMode: (value: PuzzleMode) => void;
  setShowPagination: (value: boolean) => void;
  showPagination: boolean;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  totalPuzzles: number;
  currentPuzzleIndex: number;
  onLoadPuzzleByIndex: (index: number) => void;
}

export const ModeSelector = ({
  freePlayMode,
  setFreePlayMode,
  puzzleMode,
  setPuzzleMode,
  setShowPagination,
  showPagination,
  currentPage,
  setCurrentPage,
  totalPuzzles,
  currentPuzzleIndex,
  onLoadPuzzleByIndex
}: ModeSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      {/* Mode Selector */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">⚙️ Chế Độ Chơi</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freePlayMode}
                onChange={(e) => setFreePlayMode(e.target.checked)}
                className="text-green-500 w-5 h-5"
              />
              <span className="text-white text-lg">🎮 Chơi tự do (không ràng buộc đáp án)</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="puzzleMode"
                value="random"
                checked={puzzleMode === 'random'}
                onChange={(e) => setPuzzleMode(e.target.value as PuzzleMode)}
                className="text-purple-500 w-5 h-5"
              />
              <span className="text-white text-lg">🎲 Ngẫu nhiên</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="puzzleMode"
                value="sequential"
                checked={puzzleMode === 'sequential'}
                onChange={(e) => {
                  setPuzzleMode(e.target.value as PuzzleMode);
                  setShowPagination(true);
                }}
                className="text-purple-500 w-5 h-5"
              />
              <span className="text-white text-lg">📚 Theo thứ tự (phân trang)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pagination for sequential mode */}
      {puzzleMode === 'sequential' && showPagination && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📖 Chọn Trang (6 bài/trang)</h3>
          <div className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              {/* Custom Dropdown Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '18px',
                  fontWeight: '700',
                  backgroundColor: '#000000',
                  color: '#ffff00',
                  border: '3px solid #ffff00',
                  borderRadius: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                <span style={{ color: '#ffff00', fontWeight: '700' }}>
                  Trang {currentPage} (Bài {(currentPage - 1) * 6 + 1}-{Math.min(currentPage * 6, totalPuzzles)})
                </span>
                <ChevronDown 
                  size={20} 
                  color="#ffff00"
                  style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#000000',
                    border: '3px solid #ffff00',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  {Array.from({ length: Math.ceil(totalPuzzles / 6) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        const page = i + 1;
                        setCurrentPage(page);
                        const startIndex = (page - 1) * 6;
                        onLoadPuzzleByIndex(startIndex);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: currentPage === i + 1 ? '#ff6600' : '#000000',
                        color: currentPage === i + 1 ? '#ffffff' : '#ffff00',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '700',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        borderBottom: i < Math.ceil(totalPuzzles / 6) - 1 ? '2px solid #333333' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== i + 1) {
                          e.currentTarget.style.backgroundColor = '#333333';
                          e.currentTarget.style.color = '#00ff00';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== i + 1) {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffff00';
                        }
                      }}
                    >
                      Trang {i + 1} (Bài {i * 6 + 1}-{Math.min((i + 1) * 6, totalPuzzles)})
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, i) => {
                const puzzleIndex = (currentPage - 1) * 6 + i;
                if (puzzleIndex >= totalPuzzles) return null;
                
                return (
                  <button
                    key={puzzleIndex}
                    onClick={() => onLoadPuzzleByIndex(puzzleIndex)}
                    className={`px-2 py-1 text-xs rounded ${
                      puzzleIndex === currentPuzzleIndex
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {puzzleIndex + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="text-center text-sm text-purple-200">
              Bài {currentPuzzleIndex + 1} / {totalPuzzles}
            </div>
          </div>
        </div>
      )}
    </>
  );
};