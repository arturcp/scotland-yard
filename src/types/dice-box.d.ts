declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    id?: string;
    assetPath: string;
    container?: string | null;
    theme?: string;
    themeColor?: string;
    scale?: number;
    gravity?: number;
    throwForce?: number;
    spinForce?: number;
    offscreen?: boolean;
    enableShadows?: boolean;
    onRollComplete?: (results: DiceBoxRollResult[]) => void;
  }

  interface DiceBoxRollResult {
    rolls: Array<{ value: number }>;
    value: number;
  }

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string): void;
    clear(): void;
    show(): void;
  }
}

declare module '@3d-dice/dice-box/dist/style.css';
