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

    const [reflectionTime, setReflectionTime] = useState(60);
    const [familyName, setFamilyName] = useState('');
    const [wordCivil, setWordCivil] = useState('');
    const [wordImposteur, setWordImposteur] = useState('');
    const [currentPhase, setCurrentPhase] = useState('WORD_TELLING');
    const [scores, setScores] = useState({});
    const [impostor, setImpostor] = useState(null);


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

        socket.on('hostUpdate', (hostId) => {
            setHostId(hostId);
        });

        // Quand la partie démarre
        socket.on('gameStarted', (data) => {
            setGameStarted(true);
            setCurrentPhase('WORD_TELLING');
        
            if (data?.reflectionTime) {
                setReflectionTime(data.reflectionTime);
            }
            if (data?.familyName) {
                setFamilyName(data.familyName);
            }
            if (data?.wordCivil) {
                setWordCivil(data.wordCivil);
            }
            if (data?.wordImposteur) {
                setWordImposteur(data.wordImposteur);
            }
            if (data?.players) {
                setPlayers(data.players);
            }
        });

        socket.on('startVotingPhase', () => {
            setCurrentPhase('VOTING');
        });
        
        socket.on('updateGameState', (data) => {
            setPlayers(data.players);
            setCurrentPhase(data.currentPhase);
        });

        socket.on('gameEnded', (data) => {
            if (data && data.scores) {
              setScores(data.scores);
              setImpostor(data.impostor);
            } else {
              const initialScores = {};
              players.forEach(player => {
                initialScores[player.id] = 0;
              });
              setScores(initialScores);
              setImpostor(null);
            }
          });    

        // nettoyage du listener socket
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
        <GameContext.Provider 
          value={{ 
            players, 
            hostId, 
            lobbyId, 
            userId, 
            gameStarted, 
            reflectionTime, 
            familyName,
            wordCivil,
            wordImposteur,
            currentPhase,
            startGame,
            scores,
            impostor
          }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);