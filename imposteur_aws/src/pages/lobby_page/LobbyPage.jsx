import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from './GameContext';

const LobbyPage = () => {
    const {
        players,
        hostId,
        lobbyId,
        userId,
        gameStarted,
        startGame
    } = useGameContext();

    const navigate = useNavigate();

    // États locaux pour configurer la partie
    const [numCivils, setNumCivils] = useState(1);
    const [numImposters, setNumImposters] = useState(1);
    const [numMrWhite, setNumMrWhite] = useState(0);
    const [randomDistribution, setRandomDistribution] = useState(false);

    useEffect(() => {
        // Si la partie vient de démarrer, on redirige le joueur vers l'écran de jeu
        if (gameStarted){
            navigate('/game');
        }
    }, [gameStarted, navigate]);

    const handleStartGame = () => {
        // verifier si c'est l'hote
        if (userId === hostId){
            // Construire un objet avec les paramètres de la partie
            const gameParams = {
                numCivils,
                numImposters,
                numMrWhite,
                randomDistribution
            };
            // Envoyer ces données au serveur via le GameContext
            startGame(gameParams);
        } else {
            alert("Seul l'hôte peut lancer la partie !");
        }
    };

    return (
        <div className='lobbyPage'>
            <h1>Salle d’attente </h1>
            <p>Code de la salle : <strong>{lobbyId}</strong></p>

            <div className='playersList'>
                <h2>Joueurs présents :</h2>
                <ul>
                {players.map((p) => (
                    <li key={p.id}>
                        {p.pseudo} {p.id === hostId && '(Hôte)'}
                    </li>
                ))}
                </ul>
            </div>

            {/* Seul l’hôte verra le formulaire de configuration */}
            {userId === hostId && (
                <div className='gameSettings'>
                    <h3>Paramètres de la partie</h3>

                    <label>Nombre de civils : </label>
                    <input
                        type="number"
                        value={numCivils}
                        min={1}
                        onChange={(e) => setNumCivils(Number(e.target.value))}
                    />
                    <br />

                    <label>Nombre d'imposteurs : </label>
                    <input
                        type="number"
                        value={numImposters}
                        min={1}
                        onChange={(e) => setNumImposters(Number(e.target.value))}
                    />
                    <br />

                    <label>Nombre de Mr. White : </label>
                    <input
                        type="number"
                        value={numMrWhite}
                        min={0}
                        onChange={(e) => setNumMrWhite(Number(e.target.value))}
                    />
                    <br />

                    <label>
                        <input
                        type="checkbox"
                        checked={randomDistribution}
                        onChange={(e) => setRandomDistribution(e.target.checked)}
                        />
                        Répartition aléatoire des rôles ?
                    </label>
                </div>
            )}

            <button onClick={handleStartGame} disabled={userId !== hostId}>
                Démarrer la partie
            </button>
        </div>
    );
};

export default LobbyPage;