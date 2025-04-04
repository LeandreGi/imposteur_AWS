import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamePage.css';
import { useGameContext } from '../lobby_page/GameContext';
import socket from '../socket';

const GamePage = () => {
  const navigate = useNavigate();

  const {
    players,
    hostId,
    userId,
    lobbyId,
    reflectionTime,
    familyName, 
    wordCivil,
    wordImposteur,
    currentPhase = 'WORD_TELLING'
  } = useGameContext();

  // Rôle du joueur
  const me = players.find((p) => p.id === userId);
  const myRole = me?.role;
  const myWord = me?.word;

  // Index du joueur qui est en train de jouer
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // chrono initialisé avec reflectionTime
  const [chrono, setChrono] = useState(reflectionTime);

  const [inputWord, setInputWord] = useState('');
  const [spokenWords, setSpokenWords] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [mrWhiteCanGuess, setMrWhiteCanGuess] = useState(false);
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');

  // Détermine si c'est à l'utilisateur de jouer
  const isMyTurn = players[currentPlayerIndex]?.id === userId;

  useEffect(() => {
    if (chrono > 0) {
      const timer = setTimeout(() => setChrono((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    else {
      // temps ecoulé = on passe au joueur suivant
      socket.emit('nextTurn', { lobbyId });
    }
  }, [chrono]);

  useEffect(() => {
    socket.on('updateTurn', ({ currentPlayerIndex }) => {
      setCurrentPlayerIndex(currentPlayerIndex);
      // On réinitialise le chrono pour tout le monde
      setChrono(reflectionTime);
    });

    return () => socket.off('updateTurn');
  }, [reflectionTime]);

  useEffect(() => {
    socket.on('newSpokenWords', (words) => {
      setSpokenWords(words);
    });
    return () => socket.off('newSpokenWords');
  }, []);

  useEffect(() => {
    socket.on('gameEnded', () => {
      console.log("Événement 'gameEnded' reçu, redirection vers la page des scores...");
      navigate('/score');
    });
    return () => socket.off('gameEnded');
  }, [navigate]);
  
  useEffect(() => {
    socket.on('votesUpdate', (voteCount) => {
      setVoteCounts(voteCount);
    });
    return () => socket.off('votesUpdate');
  }, []);

  useEffect(() => {
    socket.on('chatMessage', ({ userId: senderId, pseudo, message }) => {
      setChatMessages((prev) => [...prev, { senderId, pseudo, message }]);
    });
    return () => socket.off('chatMessage');
  }, []);

  const handleSendWord = () => {
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/u.test(inputWord.trim())) {
      alert("Veuillez entrer un seul mot sans espaces, sans chiffres et sans caractères spéciaux !");
      return;
    }

    if (inputWord.trim() !== '') {
      // on envoie l'info au serveur
      socket.emit('wordSpoken', {
        lobbyId,
        word: inputWord.trim(),
        pseudo: players[currentPlayerIndex]?.pseudo
      });
      setInputWord('');
      socket.emit('nextTurn', { lobbyId });
    }
  };

  const handleVoteClick = (accusedId) => {
    // Met à jour le joueur pour qui on vote
    setSelectedVote(accusedId);
  };

  const handleVote = () => {
    if (selectedVote) {
      socket.emit('vote', {
        lobbyId,
        voterId: userId,
        accusedId: selectedVote
      });
      setSelectedVote(null);
    } else {
      alert("Veuillez sélectionner un joueur à accuser.");
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim() !== '') {
      socket.emit('chatMessage', {
        lobbyId,
        userId,
        message: chatInput.trim()
      });
      setChatInput('');
    }
  };

  const startVotingPhase = () => {
    console.log("Bouton lancé : startVotingPhase");
    socket.emit('startVotingPhase', { lobbyId });
  };

  const endGame = () => {
    console.log("L'hôte met fin à la partie...");
    socket.emit('endGame', { lobbyId });
  };

useEffect(() => {
  const handleMrWhiteGuessPrompt = () => {
    if (myRole === 'mrWhite') {
      setMrWhiteCanGuess(true);
    }
  };

  const handleMrWhiteWon = ({ winnerId }) => {
    if (winnerId === userId) {
      alert("Bravo ! Vous avez deviné le mot et gagné la partie !");
    } else {
      alert("Mr White a deviné le mot !");
    }
  };

  const handleMrWhiteGuessResult = ({ success }) => {
    if (!success) {
      alert("Dommage, ce n'est pas le bon mot ! Le jeu reprend.");
    }
    setMrWhiteCanGuess(false);
  };

  socket.on('mrWhiteGuessPrompt', handleMrWhiteGuessPrompt);
  socket.on('mrWhiteWon', handleMrWhiteWon);
  socket.on('mrWhiteGuessResult', handleMrWhiteGuessResult);

  return () => {
    socket.off('mrWhiteGuessPrompt', handleMrWhiteGuessPrompt);
    socket.off('mrWhiteWon', handleMrWhiteWon);
    socket.off('mrWhiteGuessResult', handleMrWhiteGuessResult);
  };
}, [myRole, userId]);

  return (
    <div className="gameContainer">
      <header className="header">
        <h1>Partie en cours</h1>
      </header>

      {/* Affichage du message global ou de la devinette */}
      {currentPhase === 'MR_WHITE_GUESSING' ? (
        <>
          {myRole === 'mrWhite' && me?.eliminated && mrWhiteCanGuess ? (
            <div className="mrWhiteGuessSection">
              <h2>Vous êtes éliminé ! Tentez de deviner le mot civil :</h2>
              <input
                type="text"
                value={mrWhiteGuess}
                onChange={(e) => setMrWhiteGuess(e.target.value)}
                placeholder="Entrez votre proposition"
              />
              <button
                onClick={() => {
                  socket.emit('mrWhiteGuess', { lobbyId, guess: mrWhiteGuess });
                  setMrWhiteGuess('');
                }}
              >
                Tenter ma chance
              </button>
            </div>
          ) : (
            <div className="globalMessage">
              <p>Mr White tente de deviner le mot...</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Phase de mots */}
          {currentPhase === 'WORD_TELLING' && (
            <>
              {myRole === 'mrWhite'
                ? <p>Je suis Mr White, je n'ai pas de mot !</p>
                : <p>Mon mot : {myWord}</p>
              }

              <section className="chronoSection">
                <span className="chronoLabel">Temps restant : </span>
                <span className="chronoValue">{chrono}s</span>
              </section>

              <section className="inputSection">
                <input
                  type="text"
                  placeholder="Entrez votre mot ici..."
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  className="wordInput"
                  disabled={!isMyTurn}
                />
                <button 
                  onClick={handleSendWord} 
                  className="sendButton"
                  disabled={!isMyTurn}
                >
                  Envoyer
                </button>
              </section>

              <section className="spokenWordsSection">
                <h2>Mots déjà dits :</h2>
                {spokenWords.length > 0 ? (
                  <ul className="spokenWordsList">
                    {spokenWords.map((entry, index) => (
                      <li key={index}>
                        {entry.word} <span className="wordSender">- {entry.pseudo}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun mot n'a encore été dit.</p>
                )}
              </section>
            </>
          )}

          {/* Phase de votes */}
          {currentPhase === 'VOTING' && (
            <section className="votingSection">
              <h1 className="votingTitle">VOTES</h1>
              <div className="playersVotes">
                {players.map((player) => (
                  <div key={player.id} className="playerColumn">
                    <h2>{player.pseudo}</h2>
                    <div className="voteIndicators">
                      <p>Votes reçus : {voteCounts[player.id] || 0}</p>
                    </div>
                    {player.id !== userId && !player.eliminated && (
                      <button
                        className={`voteButton ${selectedVote === player.id ? 'selected' : ''}`}
                        onClick={() => handleVoteClick(player.id)}
                        disabled={me.eliminated == true}
                      >
                        vote
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className='voting_button_section'>
                <button className="validateButton" onClick={handleVote} disabled={me.eliminated == true}>
                  valider
                </button>
                {userId === hostId && (
                  <button onClick={endGame} className="endGameButton">
                    Fin de la partie : Voir le score
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Chat : affiché uniquement si on n'est pas en phase de devinette */}
          {currentPhase === 'VOTING' && (
            <div className="chatContainer">
              <h2>Chat</h2>
              <div className="chatMessages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="chatMessage">
                    <strong>{msg.pseudo} :</strong> {msg.message}
                  </div>
                ))}
              </div>
              <div className="chatInputContainer">
                <input
                  type="text"
                  placeholder="Tapez votre message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button onClick={handleSendChat}>Envoyer</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Boutons pour l'hôte */}
      {userId === hostId && currentPhase === 'WORD_TELLING' && (
        <button onClick={startVotingPhase} className="endGameButton">
          Lancement de la phase de vote
        </button>
      )}
    </div>
  );
};

export default GamePage;