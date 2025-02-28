// GamePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamePage.css';
import animaux from '../../Data/Animaux.json';
import couleurs from '../../Data/Couleurs.json';
import fruits from '../../Data/Fruits.json';
import manga from '../../Data/Manga.json';
import vehicules from '../../Data/Véhicules.json';
import villes from '../../Data/Villes.json';

const families = [animaux, couleurs, fruits, manga, vehicules, villes];

function getRandomWord(wordsArray) {
  const idx = Math.floor(Math.random() * wordsArray.length);
  return wordsArray[idx];
}

function pickFamilyAndWords() {
  const randomIndex = Math.floor(Math.random() * families.length);
  const chosenFamily = families[randomIndex];
  const randomWordCivil = getRandomWord(chosenFamily.words);
  let randomWordImposteur = getRandomWord(chosenFamily.words);
  while (randomWordImposteur === randomWordCivil) {
    randomWordImposteur = getRandomWord(chosenFamily.words);
  }
  return {
    familyName: chosenFamily.family,
    wordCivil: randomWordCivil,
    wordImposteur: randomWordImposteur
  };
}

const GamePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const username = state?.username || "Joueur";
  const role = state?.role || "Civil";
  const [chrono, setChrono] = useState(60);
  const [inputWord, setInputWord] = useState('');
  const [spokenWords, setSpokenWords] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [wordCivil, setWordCivil] = useState('');
  const [wordImposteur, setWordImposteur] = useState('');

  useEffect(() => {
    const { familyName, wordCivil, wordImposteur } = pickFamilyAndWords();
    setFamilyName(familyName);
    setWordCivil(wordCivil);
    setWordImposteur(wordImposteur);
  }, []);

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

  const endGame = () => {
    navigate('/score');
  };

  return (
    <div className="gameContainer">
      <header className="header">
        <h1>Partie en cours</h1>
      </header>

      <p>Famille : {familyName}</p>
      <p>Rôle : {role}</p>
      <p>Votre mot : {role === 'Civil' ? wordCivil : wordImposteur}</p>

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
