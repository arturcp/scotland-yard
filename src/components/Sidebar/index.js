import React, { Component } from 'react';
import './styles.css';

class Sidebar extends Component {
  render() {
    return (
      <aside id="sidebar">
        <ul>
          <li>
            <i className="fa fa-search"></i>
          </li>
          <li>
            <i className="fa fa-file-text-o"></i>
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
