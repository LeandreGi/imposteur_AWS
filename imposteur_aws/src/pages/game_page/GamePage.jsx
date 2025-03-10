// GamePage.jsx

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
  

  const goToNextPlayer = () => {
    setCurrentPlayerIndex((prevInde) => {
      const nextIndex = (prevInde + 1) % players.length;
      return nextIndex;
    } );
    // reinitialisation du chrono
    setChrono(reflectionTime);
  };

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

  const handleVote = () => {
    if (selectedVote) {
      socket.emit('vote', { lobbyId, voterId: userId, accusedId: selectedVote });
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


  return (
    <div className="gameContainer">
      <header className="header">
        <h1>Partie en cours</h1>
      </header>

      {currentPhase === 'WORD_TELLING' ? (
        <>
          <p>Famille : {familyName}</p>
          <p>Mon rôle : {myRole}</p>
          {myRole === 'mrWhite' ? <p>Je suis Mr White, je n'ai pas de mot !</p> : <p>Mon mot : {myWord}</p>}

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
            />
            <button onClick={handleSendWord} className="sendButton">
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
      ) : (
        <section className="votingSection">
    <h1 className="votingTitle">VOTES</h1>

    <div className="playersVotes">
      {players.map((player) => (
        <div key={player.id} className="playerColumn">
          <h2>{player.pseudo}</h2>

          <div className="voteIndicators">
            {players
              .filter((p) => p.id !== player.id)
              .map((other) => {

                const hasVotedFor = false;
                return (
                  <div
                    key={other.id}
                    className={`voteSquare ${hasVotedFor ? 'voted' : ''}`}
                  >
                  </div>
                );
              })}
          </div>

          <button className="voteButton">vote</button>
        </div>
      ))}
    </div>

    <button className="validateButton">valider</button>
  </section>
      )}

      {userId === hostId && currentPhase === 'WORD_TELLING' && (
        <button onClick={startVotingPhase} className="endGameButton">
          Lancement de la phase de vote
        </button>
      )}

      {userId === hostId && (
        <button onClick={endGame} className="endGameButton">
          Fin de la partie : Voir le score
        </button>
      )}
    </div>
  );
};

export default GamePage;