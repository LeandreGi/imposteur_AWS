import React from 'react';
import { useNavigate } from 'react-router-dom';

const GamePage = () => {

  const navigate = useNavigate();

  const endGame = () => {

    // implementer logique de fin de partie

    navigate('/score');
  };

  return (
    <div>
      <h1>Partie en cours</h1>
      <p>Ici, on affiche le jeu, le déroulement des tours, etc.</p>
      <button onClick={endGame}>
        Fin de la partie : Voir le score
      </button>
    </div>
  );
};

export default GamePage;