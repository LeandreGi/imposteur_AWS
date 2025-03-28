import './LobbyPage.css';
import socket from '../socket';
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
    const [numCivils, setNumCivils] = useState(2);
    const [numImposters, setNumImposters] = useState(1);
    const [numMrWhite, setNumMrWhite] = useState(0);
    const [randomDistribution, setRandomDistribution] = useState(false);
    const [reflectionTime, setReflectionTime] = useState(60);

    // on quitte le lobby au demontage
    useEffect(() => {
        return () => {
            console.log("LobbyPage se démonte");
            if (!gameStarted && lobbyId) {  // On ne quitte le lobby que si la partie n'a PAS commencé
                console.log("On émet leaveLobby car la partie n'a PAS commencé.");
                socket.emit('leaveLobby', { lobbyId });
            } else {
                console.log("La partie a commencé, on ne quitte PAS le lobby.");
            }
        };
    }, [lobbyId, gameStarted]);
    

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
                randomDistribution,
                reflectionTime
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

                    <label>Temps de réflexion par joueur (secondes) : </label>
                    <input
                        type="number"
                        value={reflectionTime}
                        min={5}
                        onChange={(e) => setReflectionTime(Number(e.target.value))}
                    />
                    <br />

                    <label>Nombre de civils : </label>
                    <input
                        type="number"
                        value={numCivils}
                        min={2}
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
                    
                </div>
            )}

            <button onClick={handleStartGame} disabled={userId !== hostId || players.length < 3}>
                Démarrer la partie
            </button>
        </div>
    );
};

export default LobbyPage;