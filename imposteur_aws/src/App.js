import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { socket } from './socket';

import './App.css';

import HomePage from './pages/connection_page/connection_page';
import LobbyPage from './pages/lobby_page/LobbyPage';
import GamePage from './pages/game_page/GamePage';
import ScorePage from './pages/score_page/ScorePage';

function App() {
  return (
    <Routes>
      {/* page d’accueil */}
      <Route path="/" element={<HomePage />} />
      
      {/* salle d’attente / lobby */}
      <Route path="/lobby" element={<LobbyPage />} />
      
      {/* jeu en cours */}
      <Route path="/game" element={<GamePage />} />

      {/* page de score */}
      <Route path="/score" element={<ScorePage />} />

      {/* page 404 */}
      <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
    </Routes>
  );
}

export default App;
