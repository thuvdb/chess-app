import { Lightbulb, CheckCircle, XCircle, SkipForward, Undo2 } from 'lucide-react';

interface ActionButtonsProps {
  onShowHint: () => void;
  onToggleSolution: () => void;
  onNewPuzzle: () => void;
  onResetBoard: () => void;
  onUndo: () => void;
  showSolution: boolean;
}

export const ActionButtons = ({ 
  onShowHint, 
  onToggleSolution, 
  onNewPuzzle, 
  onResetBoard, 
  onUndo,
  showSolution 
}: ActionButtonsProps) => {
  return (
    <div style={{paddingTop: '0px'}}>
      {/* Action Buttons - Vertical Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <button
          onClick={onShowHint}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            padding: '16px 20px',
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#d97706';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f59e0b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Lightbulb size={24} />
          💡 Gợi Ý
        </button>

        <button
          onClick={onToggleSolution}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            padding: '16px 20px',
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#8b5cf6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {showSolution ? <XCircle size={24} /> : <CheckCircle size={24} />}
          {showSolution ? '🔒 Ẩn Giải' : '🔓 Xem Giải'}
        </button>

        <button
          onClick={onUndo}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            padding: '16px 20px',
            backgroundColor: '#f97316',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ea580c';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f97316';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Undo2 size={24} />
          ↩️ Hoàn Tác
        </button>

        <button
          onClick={onNewPuzzle}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            padding: '16px 20px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <SkipForward size={24} />
          ⏭️ Bài Mới
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetBoard}
          style={{
            width: '100%',
            fontSize: '18px',
            fontWeight: '700',
            padding: '16px 20px',
            marginTop: '8px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🔄 Đặt Lại Bàn Cờ
        </button>
      </div>
    </div>
  );
};