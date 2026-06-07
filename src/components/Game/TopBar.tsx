import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';

import './TopBar.css';

interface TopBarProps {
  onLeaveGame: () => void;
}

export default function TopBar({ onLeaveGame }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleLeaveGame() {
    setMenuOpen(false);
    onLeaveGame();
  }

  return (
    <div id="top-bar" ref={menuRef}>
      <div className="top-bar-menu">
        <button
          type="button"
          className="top-bar-btn"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Ellipsis aria-hidden="true" size={16} strokeWidth={2} />
        </button>

        {menuOpen && (
          <div className="top-bar-dropdown" role="menu">
            <button type="button" className="top-bar-dropdown__item" role="menuitem" onClick={handleLeaveGame}>
              Deixar o jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
