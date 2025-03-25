import React from 'react';
import { useGameContext } from '../lobby_page/GameContext';
import { useNavigate } from 'react-router-dom';
import './ScorePage.css';

const ScorePage = () => {
    const { players, scores } = useGameContext();
    const navigate = useNavigate();

    // Filtrer tous les joueurs qui sont imposteurs ou MrWhite
    const badGuys = players.filter(player => player.role === 'imposteur' || player.role === 'mrWhite');

    return (
        <div className="ScorePage">
          <div className="page_wrapper_score_page">
            <h1>Résultats de la Partie</h1>
            <h2 className="impostor_announcement">
              {badGuys.length > 0 
                ? `Les imposteurs/Mr White étaient : ${badGuys.map(p => p.pseudo).join(', ')}`
                : "Aucun imposteur ou Mr White n'a été détecté."}
            </h2>

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
                            <td>
                              {player.pseudo}{" "}
                              {player.role === 'imposteur' && "(Imposteur)"}
                              {player.role === 'mrWhite' && "(Mr White)"}
                            </td>
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