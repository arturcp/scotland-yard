import React, { Component } from 'react';
import './styles.css';

class Square extends Component  {
  squareContent = () => {
    if (this.props.type === 'entrance') {
      return <i className="fa fa-chevron-up"></i>
    } else {
      return null;
    }
  }

  render() {
    const classes = `square ${this.props.state || ''} ${this.props.type}`
    return (
      <div data-id={`${this.props.row},${this.props.column}`} className={classes} data-direction={this.props.direction} data-row={this.props.row} data-column={this.props.column}>
        {this.squareContent()}
      </div>
    )
  }
}

export default Square;
