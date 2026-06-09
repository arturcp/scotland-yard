/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare module 'micromodal' {
  const MicroModal: {
    init: (options?: Record<string, unknown>) => void;
    show: (modalId: string, options?: Record<string, unknown>) => void;
    close: (modalId?: string) => void;
  };
  export default MicroModal;
}
