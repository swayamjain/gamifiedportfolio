import React from 'react';
import Game from './Game';
import Navbar from './Navbar'; // Create this component for the navbar

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Game />
        {/* Add your side components here in the future */}
      </main>
    </div>
  );
};

export default Layout; 