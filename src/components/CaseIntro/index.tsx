import type { ReactNode } from 'react';

import './styles.css';

/** Marcador interno no texto do caso: {{image:/images/cases/caso-113.png}} */
const IMAGE_MARKER = /\{\{image:([^}\s]+)\}\}/g;

interface CaseIntroProps {
  text: string;
  /** Classe de cada parágrafo de texto. */
  textClassName?: string;
}

/**
 * Mostra o texto de um caso. Marcadores de imagem viram `<img>` na posição indicada;
 * o marcador nunca é exibido como texto.
 */
export default function CaseIntro({ text, textClassName }: CaseIntroProps) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  const pushText = (chunk: string, key: string) => {
    const trimmed = chunk.trim();
    if (trimmed) {
      parts.push(
        <p key={key} className={textClassName}>
          {trimmed}
        </p>,
      );
    }
  };

  for (const match of text.matchAll(IMAGE_MARKER)) {
    pushText(text.slice(lastIndex, match.index), `text-${lastIndex}`);
    parts.push(
      <img
        key={`image-${match.index}`}
        className="case-intro-image"
        src={match[1]}
        alt="Ilustração do caso"
      />,
    );
    lastIndex = match.index + match[0].length;
  }
  pushText(text.slice(lastIndex), `text-${lastIndex}`);

  return <>{parts}</>;
}
