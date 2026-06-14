import './styles.css';

interface TurnBannerProps {
  message: string | null;
}

export default function TurnBanner({ message }: TurnBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="turn-banner" role="status" aria-live="polite">
      {message}
    </div>
  );
}
