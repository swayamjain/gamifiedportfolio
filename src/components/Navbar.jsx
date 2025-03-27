import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="./assets/logo.png" alt="Logo" className="logo-image" />
      </div>
      <div className="portfolio-title">Portfolio</div>
    </nav>
  );
};

export default Navbar; 