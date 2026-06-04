import { Component } from 'react';
import MovementAnimation from '../../lib/movement-animation';
import type { GameShiftView, Position } from '../../types/game';

import './styles.css';

interface SquareProps {
  type: string;
  direction: string;
  updatePlayerPosition: (playerId: number, position: Position) => void;
  state: string;
  row: number;
  column: number;
  available: boolean;
  gameShift: GameShiftView;
  path: string[] | null;
}

class Square extends Component<SquareProps> {
  squareContent = () => {
    if (this.props.type === 'entrance') {
      return <i className="fa fa-chevron-up"></i>;
    }
    return null;
  };

  squareId = () => `${this.props.row},${this.props.column}`;
  availabilityClass = () => (this.props.available ? 'available-square' : '');
  handleOnClick = () => {
    if (this.props.available && this.props.path) {
      const gameShift = this.props.gameShift;
      const player = gameShift.player;
      const newPosition = new MovementAnimation(player).move(this.props.path);

      setTimeout(() => {
        this.props.updatePlayerPosition(player.id, newPosition);
      }, this.props.path.length * 500);
    }
  };

  render() {
    const classes = `square ${this.props.state || ''} ${this.props.type} ${this.availabilityClass()}`;
    return (
      <div
        data-id={this.squareId()}
        className={classes}
        data-direction={this.props.direction}
        data-row={this.props.row}
        data-column={this.props.column}
        onClick={this.handleOnClick}
      >
        {this.squareContent()}
      </div>
    );
  }
}

export default Square;
