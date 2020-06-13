import React, { Component } from 'react';
import MicroModal from 'micromodal';
import './styles.css';

class Sidebar extends Component {
  componentDidMount() {
    MicroModal.init();
  }

  render() {
    return (
      <aside id="sidebar">
        <ul>
          <li>
            <i className="fa fa-search"></i>
          </li>
          <li>
            <i className="fa fa-file-text-o" data-micromodal-trigger="modal-notes"></i>
          </li>
          <li>
            <i className="fa fa-user-secret"></i>
          </li>
        </ul>
      </aside>
    )
  }
}

export default Sidebar;
