import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const username = state?.username || "Joueur";
  const [chrono, setChrono] = useState(60);
  const [inputWord, setInputWord] = useState('');
  const [spokenWords, setSpokenWords] = useState([]);

  useEffect(() => {
    if (chrono > 0) {
      const timer = setTimeout(() => setChrono(chrono - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [chrono]);

  const handleSendWord = () => {
    if (inputWord.trim() !== '') {
      setSpokenWords(prev => [...prev, { word: inputWord.trim(), pseudo: username }]);
      setInputWord('');
    }
  };

  // Fin de partie
  const endGame = () => {
    // Implémenter ici la logique de fin de partie
    navigate('/score');
  };

  return (
    <div className="gameContainer">
      <header className="header">
        <h1>Partie en cours</h1>
      </header>

      <section className="infoSection">
        <div className="roleInfo">
          <strong>Rôle :</strong> Civil
        </div>
        <div className="wordInfo">
          <strong>Votre mot :</strong> LIBERTÉ
        </div>
      </section>

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
        <h2>Mots dits pendant ce tour :</h2>
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
