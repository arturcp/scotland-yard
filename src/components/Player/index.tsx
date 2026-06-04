import { Component } from 'react';
import type { CSSProperties } from 'react';
import type { Player as GamePlayer } from '../../types/game';

import './styles.css';

interface PlayerProps {
  player: GamePlayer;
  style: CSSProperties;
}

class Player extends Component<PlayerProps> {
  render() {
    const style = { ...this.props.style, color: this.props.player.color };

    return (
      <div
        id={`player-${this.props.player.id}`}
        className={`player ${this.props.player.color}`}
        style={style}
      >
        <i className="fa fa-user"></i>
      </div>
    );
  }
}

export default Player;
