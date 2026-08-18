import React from 'react';
import { windowControls, isTauri } from '../services/tauriBridge';

export const WindowResizeHandles: React.FC = () => {
  if (!isTauri()) return null;

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    windowControls.startResize(direction);
  };

  const borderSize = '3px';
  const cornerSize = '8px';

  return (
    <>
      {/* 4 Edges */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'North')}
        style={{
          position: 'fixed',
          top: 0,
          left: cornerSize,
          right: cornerSize,
          height: borderSize,
          cursor: 'ns-resize',
          zIndex: 8000,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'South')}
        style={{
          position: 'fixed',
          bottom: 0,
          left: cornerSize,
          right: cornerSize,
          height: borderSize,
          cursor: 'ns-resize',
          zIndex: 8000,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'West')}
        style={{
          position: 'fixed',
          top: cornerSize,
          bottom: cornerSize,
          left: 0,
          width: borderSize,
          cursor: 'ew-resize',
          zIndex: 8000,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'East')}
        style={{
          position: 'fixed',
          top: cornerSize,
          bottom: cornerSize,
          right: 0,
          width: borderSize,
          cursor: 'ew-resize',
          zIndex: 8000,
          pointerEvents: 'auto'
        }}
      />

      {/* 4 Corners */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'NorthWest')}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nwse-resize',
          zIndex: 8500,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'NorthEast')}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nesw-resize',
          zIndex: 8500,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'SouthWest')}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nesw-resize',
          zIndex: 8500,
          pointerEvents: 'auto'
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'SouthEast')}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nwse-resize',
          zIndex: 8500,
          pointerEvents: 'auto'
        }}
      />
    </>
  );
};
