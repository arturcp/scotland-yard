import React, { Component } from 'react';
import MovementAnimation from '../../lib/movement-animation';
import './styles.css';

class Square extends Component  {
  squareContent = () => {
    if (this.props.type === 'entrance') {
      return <i className="fa fa-chevron-up"></i>;
    } else {
      return null;
    }
  }

  squareId = () => `${this.props.row},${this.props.column}`
  availabilityClass = () => this.props.available ? 'available-square' : ''
  handleOnClick = () => {
    if (this.props.available) {
      const gameShift = this.props.gameShift,
            player = gameShift.player,
            newPosition = new MovementAnimation(player).move(this.props.path);

      setTimeout(() => {
        this.props.updatePlayerPosition(player.id, newPosition);
      }, this.props.path.length * 500);
    }
  }

  render() {
    const classes = `square ${this.props.state || ''} ${this.props.type} ${this.availabilityClass()}`
    return (
      <div data-id={this.squareId()} className={classes} data-direction={this.props.direction} data-row={this.props.row} data-column={this.props.column} onClick={this.handleOnClick}>
        {this.squareContent()}
      </div>
    )
  }
}

export default Square;
