interface NavigationPanelProps {
  currentPuzzleIndex: number;
  totalPuzzles: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavigationPanel = ({
  currentPuzzleIndex,
  totalPuzzles,
  onPrevious,
  onNext
}: NavigationPanelProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🧭 Điều hướng</h3>
      <div className="flex gap-3 mb-4">
        <button
          onClick={onPrevious}
          disabled={currentPuzzleIndex <= 0}
          className="flex-1 px-4 py-3 text-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
        >
          ← Trước
        </button>
        <button
          onClick={onNext}
          disabled={currentPuzzleIndex >= totalPuzzles - 1}
          className="flex-1 px-4 py-3 text-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
        >
          Sau →
        </button>
      </div>
      <div className="text-center text-sm text-purple-200">
        {currentPuzzleIndex + 1} / {totalPuzzles}
      </div>
    </div>
  );
};