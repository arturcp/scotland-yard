import type { Player, Position } from '../types/game';

export default class MovementAnimation {
  player: Player;
  pin: HTMLElement;
  squareWidth: number;
  squareHeight: number;
  offset: number;
  paddingTop: number;
  paddingLeft: number;

  constructor(player: Player) {
    this.player = player;
    this.pin = document.querySelector(`#player-${player.id}`)!;
    this.squareWidth = 49;
    this.squareHeight = 49;
    this.offset = 8 * (player.id - 1);
    this.paddingTop = 7;
    this.paddingLeft = 3;
  }

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
      style = {
        top: (position.row ?? 0) * this.squareWidth + this.paddingTop,
        left: (position.column ?? 0) * this.squareHeight + this.paddingLeft + this.offset,
      };
    }

    this.pin.style.top = style.top + 'px';
    this.pin.style.left = style.left + 'px';
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
