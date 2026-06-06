import DetectiveLogo from '../Sidebar/DetectiveLogo';

import './MobileWarning.css';

export default function MobileWarning() {
  return (
    <div id="mobile-warning">
      <div className="mobile-warning__vignette" aria-hidden="true" />
      <div className="mobile-warning__content">
        <DetectiveLogo />
        <p className="mobile-warning__brand">Scotland Yard</p>
        <h1 className="mobile-warning__title">Apenas para desktop</h1>
        <p className="mobile-warning__message">
          Este jogo foi desenvolvido para ser jogado em computadores. Por favor, acesse em um
          desktop ou notebook para ter a melhor experiência.
        </p>
        <i className="fa-solid fa-desktop mobile-warning__icon" aria-hidden="true" />
      </div>
    </div>
  );
}
