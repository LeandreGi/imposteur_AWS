const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let lobbies = {}; 

io.on('connection', (socket) => {
    console.log('Un utilisateur connecté : ', socket.id);

    socket.on('joinLobby', ({pseudo, lobbyId}) => {
        // Vérifier si le lobby existe
        if (!lobbies[lobbyId]){
            lobbies[lobbyId] = {
                players: [],
                hostId: socket.id,
                gameStarted: false,
                gameConfig: {}
            };
        }

        // Ajouter le joueur à la liste des joueurs du lobby
        lobbies[lobbyId].players.push({
            id: socket.id,
            pseudo
        });

        //Envoyer au nouveau client les infos completes 
        socket.join(lobbyId);
        io.to(socket.id).emit('lobbyData', {
            players: lobbies[lobbyId].players,
            hostId: lobbies[lobbyId].hostId,
            lobbyId: lobbyId,
            gameStarted: lobbies[lobbyId].gameStarted
        });

        // notifier tout le lobby
        io.to(lobbyId).emit('playersUpdate', lobbies[lobbyId].players);
    });

    socket.on('startGame', ({lobbyId, 
        numCivils,
        numImposters,
        numMrWhite,
        randomDistribution
    }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;

        if (socket.id === lobby.hostId){
            // Stocker la config dans notre structure
            lobby.gameConfig = {
                numCivils,
                numImposters,
                numMrWhite,
                randomDistribution
            };

            // Distribuer les roles ici ?

            lobby.gameStarted = true;
            // informer tout les joueurs
            io.to(lobbyId).emit('gameStarted');
        }
    });

    socket.on('disconnect', () => { 
        // Retirer le joueur du lobbies où il etait
        for (const [id, lobby] of Object.entries(lobbies)) {
            lobby.players = lobby.players.filter(p => p.id !== socket.id);
            // si c'était l'hote on transitione le role vers une autre personne 
            if (lobby.hostId === socket.id && lobby.players.length > 0){
                lobby.hostId = lobby.players[0].id;
            }
            io.to(id).emit('playersUpdate', lobby.players);
        }
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});