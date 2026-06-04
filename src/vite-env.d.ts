/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

declare module 'micromodal' {
  const MicroModal: {
    init: (options?: Record<string, unknown>) => void;
  };
  export default MicroModal;
}
