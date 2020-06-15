import React, { Component } from 'react';
import './styles.css';

class Player extends Component {
  render() {
    this.props.style.color = this.props.player.color;

    return (
      <div className={`player ${this.props.player.color}`} style={this.props.style}>
        <i className="fa fa-user"></i>
      </div>
    )
  }
}

export default Player;
