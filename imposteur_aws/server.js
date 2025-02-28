const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // ça ça autorise tout le monde, donc tous les ports peuvent se connecter au backend, donc faudra régler ça plus tard
        methods: ['GET', 'POST']
    }
});


let lobbies = {}; 

io.on('connection', (socket) => {
    console.log('Un utilisateur connecté : ', socket.id);
    
    socket.on('createLobby', ({pseudo, lobbyId}) => {
        if (lobbies[lobbyId]) {
            // Le code est deja pris le joueur doit recliquer sur le bouton
            return;
        }

        // création du nouveau lobby
        lobbies[lobbyId] = {
            id: lobbyId,
            players: [],
            hostId: socket.id,
            gameStarted: false
        };

        // l'hote rejoint le lobby
        socket.join(lobbyId);

        // ajout du joueur à la liste des joueurs
        lobbies[lobbyId].players.push({
            id: socket.id,
            pseudo: pseudo,
        });

        // envoi des infos du lobby au client
        
        io.to(socket.id).emit('lobbyData', {
            lobbyId,
            players: lobbies[lobbyId].players,
            hostId: lobbies[lobbyId].hostId,
            gameStarted: lobbies[lobbyId].gameStarted,
        });

        // averti tout le lobby qu'un joueur a rejoint
        io.to(lobbyId).emit('playersUpdate', lobbies[lobbyId].players);
    });

    socket.on('joinLobby', ({pseudo, lobbyId}) => {
        // Vérifier si le lobby existe
        const existingLobby = lobbies[lobbyId];

        if (!existingLobby) {
            socket.emit('lobbyNotFound', { lobbyId });
            return;
        }

        // Ajouter le joueur à la liste des joueurs du lobby
        socket.join(lobbyId);
        existingLobby.players.push({ id: socket.id, pseudo }); 
        

        //Envoyer au nouveau client les infos completes
        io.to(socket.id).emit('lobbyData', {
            players: existingLobby.players,
            hostId: existingLobby.hostId,
            lobbyId: lobbyId,
            gameStarted: existingLobby.gameStarted
        });

        // notifier tout le lobby
        io.to(lobbyId).emit('playersUpdate', existingLobby.players);
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

    socket.on('leaveLobby', ({ lobbyId }) => {
        
        const lobby = lobbies[lobbyId];
        if (!lobby) return; 
      
        // Supprime le socket.id du joueur de la liste des joueurs
        lobby.players = lobby.players.filter((player) => player.id !== socket.id);
      
        // si c'était l'hote on transitione le role vers une autre personne 
        if (lobby.hostId === socket.id && lobby.players.length > 0){
            lobby.hostId = lobby.players[0].id;
        }

        // Le joueur quitte la room
        socket.leave(lobbyId);
      
        // Informe les autres joueurs de la mise à jour
        io.to(lobbyId).emit('playersUpdate', lobby.players);
    });

    socket.on('disconnect', () => { 
        // Retirer le joueur du lobbies où il etait
        console.log('Un utilisateur déconnecté : ', socket.id);
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

const PORT = 4000;
server.listen(PORT, () => {
    console.log('Serveur démarré sur le port', PORT);
});