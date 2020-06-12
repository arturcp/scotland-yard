import React, { Component } from 'react';
import './sizes.css';
import './styles.css';

class Places extends Component  {
  render() {
    return (
      <div>
        <div className="place holmes-house w3 h4">Casa de Sherlock Holmes</div>
        <div className="place museum w6 h4">Museu</div>
        <div className="place bar w5 h3">Bar</div>
        <div className="place big-bang w6 h2-half">Big-bang</div>
        <div className="place drugstore w6 h2-half">Farmácia</div>
        <div className="place book-store w4 h3">Livraria</div>
        <div className="place locksmith w3 h3">Chaveiro</div>
        <div className="place empty-area w3 h3"></div>
        <div className="place docks w10 h4">Docas</div>
        <div className="place park w6 h6">
          <div className="name">Parque</div>
        </div>
        <div className="place pawnshop w3 h5">Casa de penhores</div>
        <div className="place theater w6 h3">Teatro</div>
        <div className="place hotel w3 h5">Hotel</div>
        <div className="place cigar-shop w3 h5">Charutaria</div>
        <div className="place graveyard w6 h2">Cemitério</div>
        <div className="place carriage-station w6 h3">Estação de carruagem</div>
      </div>
    )
  }
}

export default Places;
