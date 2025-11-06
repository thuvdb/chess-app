import React from 'react';
import { Trophy, Clock } from 'lucide-react';
import { Stats } from '../types/chess';
import { ChessUtils } from '../utils/chessUtils';

interface StatsPanelProps {
  stats: Stats;
  timer: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, timer }) => {
  return (
    <>
      {/* Stats Card */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          <Trophy color="#fbbf24" size={28} />
          Thống Kê
        </h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Đã giải:</span>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#10b981',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>{stats.solved}</span>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Tổng thử:</span>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#3b82f6',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>{stats.attempts}</span>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>Tỷ lệ:</span>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#fbbf24',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>{stats.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '24px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Clock color="#3b82f6" size={32} />
          <span style={{
            fontSize: '36px',
            fontFamily: 'monospace',
            fontWeight: '800',
            color: '#ffffff',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
          }}>
            {ChessUtils.formatTime(timer)}
          </span>
        </div>
      </div>
    </>
  );
};