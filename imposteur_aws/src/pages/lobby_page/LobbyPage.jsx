import React from 'react';

import { useNavigate } from 'react-router-dom';

const LobbyPage = () => {
    const navigate = useNavigate();

    const startGame = () => {

        // implémenter la logique pour initialiser la partie

        navigate('/game');
    };

    return (
        <div>
            <h1>Salle d’attente</h1>
            <p>Ici, on prépare la partie et on attend les joueurs...</p>
            <button onClick={startGame}>Démarrer la partie</button>
        </div>
    );
};

export default LobbyPage;