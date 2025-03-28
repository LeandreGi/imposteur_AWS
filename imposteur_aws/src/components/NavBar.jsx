import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const navBarStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',

    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: 0,
    left: 0,

    width: '100%',
    height: 'auto',
    zIndex: 9999, 
  };

  const logoStyle = {
    width: '130px',
    height: 'auto',
    margin: '10px',
    cursor: 'pointer'
  };

  return (
    <nav style={navBarStyle}>
      <Link to="/">
        <img 
          src="/assets/logo/logo.png" 
          alt="Retour à l'accueil" 
          style={logoStyle}
        />
      </Link>
    </nav>
  );
};

export default NavBar;