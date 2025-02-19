import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './score_page.module.css';

const ScorePage = () => {
  const navigate = useNavigate();

  const scoreData = [
    { id: 1, username: 'LeandreG', score: 10 },
    { id: 2, username: 'Laetitia', score: 10 },
    { id: 3, username: 'Mohammed', score: 10 },
  ];

const HandleBackToHome = () => {
  navigate('/');
};

  return (
    <div className={styles.page_wrapper}>
      <div className={styles.score_card}>
        <h1>Score final</h1>
        <div className={styles.score_list}>
          {scoreData.map((player) => (
            <div key={player.id} className={styles.score_item}>
              <h2>{player.username}</h2>
              <p>Score : {player.score}</p>
            </div>
          ))}
        </div>
        <button className={styles.button_style} onClick={HandleBackToHome}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default ScorePage;