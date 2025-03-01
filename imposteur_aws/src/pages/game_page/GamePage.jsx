// GamePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamePage.css';
import { useGameContext } from '../lobby_page/GameContext';

const GamePage = () => {
  const navigate = useNavigate();

  // On récupère tout depuis le contexte
  const {
    players,
    userId,
    reflectionTime,
    familyName,  // choisi par le serveur
    wordCivil,
    wordImposteur
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

  // Détermine si c'est à l'utilisateur de jouer
  const isMyTurn = players[currentPlayerIndex]?.id === userId;

  useEffect(() => {
    if (chrono > 0) {
      const timer = setTimeout(() => setChrono((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    else {
      // temps ecoulé = on passe au joueur suivant
      goToNextPlayer();
    }
  }, [chrono]);

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
      setSpokenWords(prev => [
        ...prev, 
        { word: inputWord.trim(), pseudo: players[currentPlayerIndex]?.pseudo }
      ]);
      setInputWord('');
      goToNextPlayer();
    }
  };

  const endGame = () => {
    navigate('/score');
  };

  return (
    <div className="gameContainer">
      <header className="header">
        <h1>Partie en cours</h1>
      </header>

      <p>Famille : {familyName}</p>
      {/* Afficher mon rôle et mon mot */}
      <p>Mon rôle : {myRole}</p>
      {myRole === 'MrWhite' ? (
        <p>Je suis Mr White, je n'ai pas de mot !</p>
      ) : (
        <p>Mon mot : {myWord}</p>
      )}

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
        <button 
          onClick={handleSendWord} 
          className="sendButton"
          disabled={currentPlayerIndex !== players.findIndex(p => p.id === userId)}
        >
          Envoyer
        </button>
        {!isMyTurn && (
          <p className="waitingMessage">
            C'est à {players[currentPlayerIndex]?.pseudo} de jouer...
          </p>
        )}
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

      <button onClick={endGame} className="endGameButton">
        Fin de la partie : Voir le score
      </button>
    </div>
  );
};

export default GamePage;