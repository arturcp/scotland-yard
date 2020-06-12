import React, { Component } from 'react';
import './styles.css';

class Square extends Component  {
  render() {
    const classes = `square ${this.props.state || ''}`
    return (
      <div className={classes} data-row={this.props.row} data-column={this.props.column}>
      </div>
    )
  }
}

export default Square;
