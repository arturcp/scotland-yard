import type { Player, Position } from '../types/game';

export default class MovementAnimation {
  player: Player;
  players: Player[];
  pin: HTMLElement;
  squareWidth: number;
  squareHeight: number;
  paddingTop: number;
  paddingLeft: number;

  constructor(player: Player, players: Player[]) {
    this.player = player;
    this.players = players;
    this.pin = document.querySelector(`#player-${player.id}`)!;
    this.squareWidth = 49;
    this.squareHeight = 49;
    this.paddingTop = 7;
    this.paddingLeft = 3;
  }

  getCenteredOffset = (position: Position): number => {
    const playersAtSamePos = this.players.filter((p) => {
      if (p.id === this.player.id) return false;
      const pPos = p.position;
      if (position.place) {
        return pPos.place === position.place;
      }
      return (
        (pPos.row ?? 0) === (position.row ?? 0) &&
        (pPos.column ?? 0) === (position.column ?? 0)
      );
    });

    playersAtSamePos.push(this.player);
    playersAtSamePos.sort((a, b) => a.id - b.id);

    const idx = playersAtSamePos.findIndex((p) => p.id === this.player.id);
    const N = playersAtSamePos.length;
    const spacing = 8;

    return 9.5 - 4 * (N - 1) + spacing * idx;
  };

  move = (path: string[]) => {
    path.forEach((element, index) => {
      setTimeout(() => {
        const position = this.parse(element);
        this.moveTo(position);
      }, 500 * index);
    });

    return this.parse(path[path.length - 1]);
  };

  moveTo = (position: Position) => {
    let style: { top?: number; left?: number } = {};

    if (position.place) {
      style = {};
    } else {
      const offset = this.getCenteredOffset(position);
      style = {
        top: (position.row ?? 0) * this.squareWidth + this.paddingTop,
        left: (position.column ?? 0) * this.squareHeight + this.paddingLeft + offset,
      };
    }

    if (style.top !== undefined && style.left !== undefined) {
      this.pin.style.top = style.top + 'px';
      this.pin.style.left = style.left + 'px';
    }
  };

  parse = (notation: string): Position => {
    if (notation.indexOf(',') > -1) {
      const parts = notation.split(',');
      return {
        row: parseInt(parts[0]),
        column: parseInt(parts[1]),
        place: null,
      };
    }
    return { place: notation };
  };
}
