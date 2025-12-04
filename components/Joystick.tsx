import React, { useRef, useState, useEffect } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setActive(true);
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), rect.width / 2);
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    setPosition({ x, y });
    
    // Normalize output to -1 to 1
    onMove(x / (rect.width / 2), y / (rect.height / 2));
  };

  const handleEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  // Mouse Listeners
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: MouseEvent) => { if (active) handleMove(e.clientX, e.clientY); };
  const onMouseUp = () => handleEnd();

  // Touch Listeners
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  useEffect(() => {
    if (active) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [active]);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-8 left-8 w-32 h-32 bg-black/20 rounded-full backdrop-blur-sm border-2 border-white/30 z-50 touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="absolute w-12 h-12 bg-white/80 rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: '50%', 
          top: '50%', 
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))` 
        }}
      />
    </div>
  );
};