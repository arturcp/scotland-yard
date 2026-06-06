import './TopBar.css';

export default function TopBar() {
  return (
    <div id="top-bar">
      <button type="button" className="top-bar-btn" aria-label="Menu">
        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
      </button>
    </div>
  );
}
