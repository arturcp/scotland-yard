const PIP_POSITIONS = [
  [9, 9],
  [23, 9],
  [16, 16],
  [9, 23],
  [23, 23],
];

export default function DiceIcon() {
  return (
    <svg
      className="sidebar-dice-icon"
      viewBox="0 0 32 32"
      aria-hidden="true"
      role="presentation"
    >
      <rect x="2" y="2" width="28" height="28" rx="5" fill="currentColor" />
      {PIP_POSITIONS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" className="sidebar-dice-pip" />
      ))}
    </svg>
  );
}
