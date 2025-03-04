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


const animaux = require('./src/Data/Animaux.json');
const couleurs = require('./src/Data/Couleurs.json');
const fruits = require('./src/Data/Fruits.json');
const manga = require('./src/Data/Manga.json');
const vehicules = require('./src/Data/Véhicules.json');
const villes = require('./src/Data/Villes.json');

const familles = [animaux, couleurs, fruits, manga, vehicules, villes];

let lobbies = {}; 

function pickRandomFamilyAndWords() {
    const randomIndex = Math.floor(Math.random() * familles.length);
    const chosenFamily = familles[randomIndex];
    
    // Mot Civil
    const wordCivil = chosenFamily.words[
      Math.floor(Math.random() * chosenFamily.words.length)
    ];
  
    // Mot Imposteur (différent du mot Civil)
    let wordImposteur = chosenFamily.words[
      Math.floor(Math.random() * chosenFamily.words.length)
    ];
    while (wordImposteur === wordCivil) {
      wordImposteur = chosenFamily.words[
        Math.floor(Math.random() * chosenFamily.words.length)
      ];
    }
  
    return {
      familyName: chosenFamily.family,
      wordCivil,
      wordImposteur
    };
}

io.on('connection', (socket) => {
    
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

    socket.on('startGame', ({
        lobbyId, 
        numCivils,
        numImposters,
        numMrWhite,
        randomDistribution,
        reflectionTime
    }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;

        // Seul l’hôte peut lancer la partie
        if (socket.id !== lobby.hostId) return;

        const { players } = lobby;
        const nbPlayers = players.length;

        const rolesArray = [];
        for (let i = 0; i < numCivils; i++) {
            rolesArray.push('civil');
        }
        for (let i = 0; i < numImposters; i++) {
            rolesArray.push('imposteur');
        }
        for (let i = 0; i < numMrWhite; i++) {
            rolesArray.push('mrWhite');
        }

        // Si on a pas assez de roles pour tous les joueurs
        if (rolesArray.length < nbPlayers) {
            const missing = nbPlayers - rolesArray.length;
            for (let i = 0; i < missing; i++) {
                rolesArray.push('civil');
            }
        }

        // Mélanger les roles
        for (let i = rolesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rolesArray[i], rolesArray[j]] = [rolesArray[j], rolesArray[i]];
        }

        const { familyName, wordCivil, wordImposteur } = pickRandomFamilyAndWords();

        // Envoyer les roles et les mots à chaque joueur
        players.forEach((player, index) => {
            const r = rolesArray[index] || 'civil';
            player.role = r;
            if (r === 'civil') {
                player.word = wordCivil;
            } else if (r === 'imposteur') {
                player.word = wordImposteur;
            } else {
                // MrWhite
                player.word = '';
            }
        });

        lobby.gameConfig = {
            familyName,
            wordCivil,
            wordImposteur,
            reflectionTime
        };
        lobby.gameStarted = true;

        // informer les joueurs que la partie a commencé
        io.to(lobbyId).emit('gameStarted', {
            reflectionTime,
            familyName,
            wordCivil,
            wordImposteur,
            players : players.map(p => ({
                id: p.id, 
                pseudo: p.pseudo, 
                role: p.role, 
                word: p.word
            }))
        });
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

    socket.on('endGame', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        console.log(`Demande de fin de partie reçue pour le lobby ${lobbyId} par ${socket.id}`);
      
        if (!lobby) {
          console.log("Lobby introuvable !");
          return;
        }
      
        if (socket.id !== lobby.hostId) {
          console.log("Tentative de fin de partie par un joueur qui n'est pas l'hôte ce con!");
          return;
        }

        lobby.gameStarted = false;
        console.log("Partie terminée, envoi de l'événement 'gameEnded' à tous les joueurs du lobby AAAAAAAAAAAAAAAAAAAAAAAAAH", lobbyId);
      
        io.to(lobbyId).emit('gameEnded');
      });
      
      
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log('Serveur démarré sur le port', PORT);
});