export default class MovementAnimation {
  constructor(player) {
    this.player = player;
    this.pin = document.querySelector(`#player-${player.id}`);
    this.squareWidth = 49;
    this.squareHeight = 49;
    this.offset = 8 * (player.id - 1);
    this.paddingTop = 7;
    this.paddingLeft = 3;
  }

  move = (path) => {
    path.forEach((element, index) => {
      setTimeout(() => {
        const position = this.parse(element);
        this.moveTo(position);
      }, 500 * index);
    });

    return this.parse(path[path.length - 1]);
  }

  moveTo = (position) => {
    let style = '';

    if (position.place) {
      style = {
        // top: this.state.places[position.place].top,
        // left: this.state.places[position.place].left + this.offset
      }
    } else {
      style = {
        top: position.row * this.squareWidth + this.paddingTop,
        left: position.column * this.squareHeight + this.paddingLeft + this.offset
      }
    };

    this.pin.style.top = style.top + 'px';
    this.pin.style.left = style.left + 'px';
  }

  parse = (notation) => {
    const position = {};

    if (notation.indexOf(',') > -1) {
      const parts = notation.split(',');
      position.row = parseInt(parts[0]);
      position.column = parseInt(parts[1]);
      position.place = null;
    } else {
      position.place = notation;
    }
    return position;
  }
}
