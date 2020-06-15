import React, { Component } from 'react';
import './styles.css';

class Player extends Component {
  render() {
    return (
      <div className={`player ${this.props.player.color}`} style={this.props.style}>
        <i className="fa fa-user"></i>
      </div>
    )
  }
}

export default Player;
