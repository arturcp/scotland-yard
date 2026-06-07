import { Ellipsis } from 'lucide-react';

import './TopBar.css';

export default function TopBar() {
  return (
    <div id="top-bar">
      <button type="button" className="top-bar-btn" aria-label="Menu">
        <Ellipsis aria-hidden="true" size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
