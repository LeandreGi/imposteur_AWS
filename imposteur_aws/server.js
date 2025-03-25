const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['https://imposteur-aws.vercel.app', 'https://imposteur-aws.onrender.com'],
        methods: ['GET', 'POST'],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
        transports: ['websocket', 'polling'],
    },
    allowEIO3: true,
});
 
app.get('/', (req, res) => {
    res.send("Le serveur est en ligne !");
  });

const animaux = require('./src/Data/Animaux.json');
const couleurs = require('./src/Data/Couleurs.json');
const fruits = require('./src/Data/Fruits.json');
const manga = require('./src/Data/Manga.json');
const vehicules = require('./src/Data/Véhicules.json');
const villes = require('./src/Data/Villes.json');

const familles = [animaux, couleurs, fruits, manga, vehicules, villes];

let lobbies = {}; 
let lobbyWords = {};

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

function updateVotes(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;
    const voteCount = {};
    Object.values(lobby.votes).forEach((accusedId) => {
      if (!voteCount[accusedId]) {
        voteCount[accusedId] = 0;
      }
      voteCount[accusedId]++;
    });
    io.to(lobbyId).emit('votesUpdate', voteCount);
  };

  function processVotes(lobby, lobbyId) {
    const voteCount = {};
    Object.values(lobby.votes).forEach(accId => {
        if (!voteCount[accId]) voteCount[accId] = 0;
        voteCount[accId]++;
    });

    let maxVotes = -1;
    let eliminatedId = null;
    for (const accusedId in voteCount) {
        if (voteCount[accusedId] > maxVotes) {
            maxVotes = voteCount[accusedId];
            eliminatedId = accusedId;
        }
    }

    // Élimination du joueur
    const eliminatedPlayer = lobby.players.find(p => p.id === eliminatedId);
    if (eliminatedPlayer) {
        eliminatedPlayer.eliminated = true;
        if (eliminatedPlayer && eliminatedPlayer.role === 'mrWhite') {
            lobby.currentPhase = 'MR_WHITE_GUESSING';
            io.to(eliminatedPlayer.id).emit('mrWhiteGuessPrompt', {});
            sendGameState(lobbyId);
            return;
        }
    }

    // Calcul des scores
    let scores = calculateScores(lobby);

    lobby.votes = {}; // Réinitialisation des votes

    // Vérification des conditions de fin de partie
    if (checkEndGameConditions(lobby)) {
        io.to(lobbyId).emit('gameEnded', { scores, impostor: lobby.players.find(p => p.role === 'imposteur') });
    } else {
        lobby.currentPhase = 'WORD_TELLING';

        if (lobby.players[lobby.currentPlayerIndex].eliminated) {
            do {
                lobby.currentPlayerIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
            } while (lobby.players[lobby.currentPlayerIndex].eliminated);
        }

        sendGameState(lobbyId);

        io.to(lobbyId).emit('updateTurn', { currentPlayerIndex: lobby.currentPlayerIndex });
    }
}


function calculateScores(lobby) {
    let scores = {};
    let impostor = lobby.players.find(p => p.role === 'imposteur');

    lobby.players.forEach(player => {
        scores[player.id] = 0;
    });

    if (impostor) {
        lobby.players.forEach(player => {
            if (player.role === 'civil') {
                if (lobby.votes[player.id] === impostor.id) {
                    scores[player.id] += 100;
                } else {
                    scores[impostor.id] += 100; // L'imposteur gagne 100 points si un civil ne vote pas contre lui
                }
            }
        });
    }
    console.log(scores)

    return scores;
}


function checkEndGameConditions(lobby) {
    const livingPlayers = lobby.players.filter(p => !p.eliminated);
    const imposters = livingPlayers.filter(p => p.role === 'imposteur');
    const mrWhite = livingPlayers.filter(p => p.role === 'mrWhite');
    const civils = livingPlayers.filter(p => p.role === 'civil');
  
    // plus d’imposteurs ni de Mr White = civils gagnent
    if (imposters.length === 0 && mrWhite.length === 0) {
        return true;
    }
    // imposteurs >= civils = imposters gagnent
    if (imposters.length >= civils.length) {
        return true;
    }
    return false;
}

function sendGameState(lobbyId) {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;
    io.to(lobbyId).emit('updateGameState', {
      players: lobby.players,
      currentPhase: lobby.currentPhase,
      currentPlayerIndex: lobby.currentPlayerIndex,
      spokenWords: lobby.spokenWords || [],
      reflectionTime: lobby.reflectionTime
    });
  }

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
            gameStarted: false,
            currentPhase : 'WORD_TELLING',
            votes: {}
        };

        // l'hote rejoint le lobby
        socket.join(lobbyId);
        console.log(`Le joueur ${socket.id} a créé le lobby ${lobbyId}`);

        // ajout du joueur à la liste des joueurs
        lobbies[lobbyId].players.push({
            id: socket.id,
            pseudo,
            role: null,
            word: null,
            eliminated: false
        });

        // envoi des infos du lobby au client
        
        io.to(socket.id).emit('lobbyData', {
            lobbyId,
            players: lobbies[lobbyId].players,
            hostId: lobbies[lobbyId].hostId,
            gameStarted: lobbies[lobbyId].gameStarted,
            currentPhase: lobbies[lobbyId].currentPhase
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
        existingLobby.players.push({ 
            id: socket.id, 
            pseudo,
            role: null,
            word: null,
            eliminated: false 
        });
        console.log(`Le joueur ${socket.id} a rejoint le lobby ${lobbyId}`);
        

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

        lobby.currentPhase = 'WORD_TELLING';
        lobby.currentPlayerIndex = 0;
        lobby.spokenWords = [];
        // informer les joueurs que la partie a commencé
        io.to(lobbyId).emit('gameStarted', {
            reflectionTime,
            familyName,
            wordCivil,
            wordImposteur,
            currentPlayerIndex : lobby.currentPlayerIndex,
            players : players.map(p => ({
                id: p.id, 
                pseudo: p.pseudo, 
                role: p.role, 
                word: p.word
            }))
        });
    });

    socket.on('nextTurn', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;
        console.log(lobby.currentPlayerIndex);

        //probleme comment savoir si on a fait un tour complet
        do {
            lobby.currentPlayerIndex = (lobby.currentPlayerIndex + 1) % lobby.players.length;
        } while (lobby.players[lobby.currentPlayerIndex].eliminated);

        console.log(lobby.currentPlayerIndex);

        if (lobby.currentPlayerIndex === 0) {
            lobby.currentPhase = 'VOTING';
            io.to(lobbyId).emit('startVotingPhase');
        } else {
            io.to(lobbyId).emit('updateTurn', { currentPlayerIndex: lobby.currentPlayerIndex });
        }
        sendGameState(lobbyId);
    });

    socket.on('wordSpoken', ({ lobbyId, word, pseudo }) => {
        if (!lobbyWords[lobbyId]) {
          lobbyWords[lobbyId] = [];
        }
    
        // Ajoute ce mot au tableau correspondant au lobby
        lobbyWords[lobbyId].push({ word, pseudo });
    
        // Broadcast à tous les joueurs du lobby la liste à jour
        io.to(lobbyId).emit('newSpokenWords', lobbyWords[lobbyId]);
    });

    socket.on('startVotingPhase', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) {
          console.log("Lobby introuvable dans startVotingPhase");
          return;
        }
        if (socket.id !== lobby.hostId) {
          console.log("startVotingPhase refusé : ce socket n'est pas l'hôte");
          return;
        }
        lobby.currentPhase = 'VOTING';
        console.log(`Phase de vote lancée dans le lobby ${lobbyId} par l'hôte ${socket.id}`);
        io.to(lobbyId).emit('startVotingPhase');
        sendGameState(lobbyId);
      });

      /////////////////////////////
      socket.on('mrWhiteGuess', ({ lobbyId, guess }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;
    
        const mrWhitePlayer = lobby.players.find(p => p.id === socket.id);
        if (!mrWhitePlayer || mrWhitePlayer.role !== 'mrWhite') return;
        if (guess.toLowerCase() === lobby.gameConfig.wordCivil.toLowerCase()) {
            io.to(lobbyId).emit('mrWhiteWon', { winnerId: mrWhitePlayer.id });
            io.to(lobbyId).emit('gameEnded');
        } else {
            io.to(mrWhitePlayer.id).emit('mrWhiteGuessResult', { success: false });
            lobby.currentPhase = 'WORD_TELLING';
            sendGameState(lobbyId);
            io.to(lobbyId).emit('updateTurn', { currentPlayerIndex: lobby.currentPlayerIndex });
        }
    });
    /////////////////////////////

      socket.on('vote', ({ lobbyId, voterId, accusedId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;
        lobby.votes[voterId] = accusedId;
        updateVotes(lobbyId);
        // On vérifie si tous les joueurs vivants ont voté
        const alivePlayers = lobby.players.filter(p => !p.eliminated);
        if (Object.keys(lobby.votes).length === alivePlayers.length) {
            processVotes(lobby, lobbyId);
        }
    });

    socket.on('chatMessage', ({ lobbyId, userId, message }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return;
        const sender = lobby.players.find(p => p.id === userId);
        if (!sender) return;      
        io.to(lobbyId).emit('chatMessage', {
          userId,
          pseudo: sender.pseudo,
          message
        });
      });

    socket.on('leaveLobby', ({ lobbyId }) => {
        const lobby = lobbies[lobbyId];
        if (!lobby) return; 
        
        if (lobby.gameStarted) {
            return
        }

        console.log(`Le joueur ${socket.id} quitte le lobby ${lobbyId}`);
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
        io.to(lobbyId).emit('hostUpdate', lobby.hostId);
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

        lobby.gameStarted = false;
        console.log("Partie terminée, envoi de l'événement 'gameEnded' à tous les joueurs du lobby AAAAAAAAAAAAAAAAAAAAAAAAAH", lobbyId);
        console.log(`Joueurs dans le lobby ${lobbyId}:`, lobby.players.map(p => p.id));
        io.to(lobbyId).emit('gameEnded');
      });
      
      
});  

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log('Serveur démarré sur le port', PORT);
});
