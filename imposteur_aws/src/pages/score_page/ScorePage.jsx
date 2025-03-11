import React from 'react';
import { useGameContext } from '../lobby_page/GameContext';
import { useNavigate } from 'react-router-dom';
import './ScorePage.css';

const ScorePage = () => {
    const { players, scores, impostor } = useGameContext();
    const navigate = useNavigate();

    return (
        <div className="ScorePage">
          <div className="page_wrapper_score_page">
            <h1>Résultats de la Partie</h1>
            <h2 className="impostor_announcement">L'imposteur était : {impostor?.pseudo}</h2>

            <table className="score_table">
                <thead>
                    <tr>
                        <th>Joueur</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.id}>
                            <td>{player.pseudo} {player.role === 'imposteur' ? "(Imposteur)" : ""}</td>
                            <td>{scores[player.id] || 0} points</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="return_button" onClick={() => navigate('/')}>Retour à l'accueil</button>
          </div>
        </div>
    );
};

export default ScorePage;
