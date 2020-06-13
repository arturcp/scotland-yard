import React, { Component } from 'react';
import './sizes.css';
import './styles.css';

class Places extends Component  {
  render() {
    return (
      <div>
        <div className="place holmes-house w3 h4"></div>
        <div className="place museum w6 h4"></div>
        <div className="place bar w5 h3"></div>
        <div className="place big-bang w6 h2-half"></div>
        <div className="place drugstore w6 h2-half"></div>
        <div className="place book-store w4 h3"></div>
        <div className="place locksmith w3 h3"></div>
        <div className="place key w3 h3"></div>
        <div className="place bridge w4 h4"></div>
        <div className="place docks w6 h3"></div>
        <div className="place park w6 h6"></div>
        <div className="place pawnshop w3 h5"></div>
        <div className="place theater w6 h3"></div>
        <div className="place hotel w3 h5"></div>
        <div className="place cigar-shop w3 h5"></div>
        <div className="place graveyard w6 h2"></div>
        <div className="place carriage-station w6 h3"></div>
        <div className="place bank w7 h2"></div>
        <div className="place street w3 h3"></div>
        <div className="place scotland-yard w5 h3"></div>
      </div>
    )
  }
}

export default Places;
