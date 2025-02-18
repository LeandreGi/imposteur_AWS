import React, { createContext, useContext, useState, useEffect, use } from 'react';
import io from 'socket.io-client';
import socket from '../socket';


const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [lobbyId, setLobbyId] = useState(null);
    const [userId, setUserId] = useState(null); // pour voir si le joueur est l'hôte ou non
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        // Récupérer son propre socket.id
        socket.on('connect', () => {
            setUserId(socket.id);
        });

        // se connecter au lobby existant ou on en crée un nouveau
        socket.on('lobbyData', (data) => {
            setPlayers(data.players);
            setHostId(data.hostId);
            setLobbyId(data.lobbyId);
            setGameStarted(data.gameStarted);
        });

        // Quand un joueur rejoint ou quitte, on recoit la liste mise à jour
        socket.on('playersUpdate', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        })

        // Quand la partie démarre
        socket.on('gameStarted', () => {
            setGameStarted(true);
        });

        // on nettoie à la fermeture du composant ou quand on change de page
        return () => {
            socket.disconnect();
        };
    }, []);

    // Méthode pour démarrer la partie coté client
    // previent le serveur que l'hote veut lancer
    const startGame = (gameParams) => {
        socket.emit('startGame', {
            lobbyId,
            ...gameParams,
        });
    };

    return (
        <GameContext.Provider value={{ players, hostId, lobbyId, userId, gameStarted, startGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);