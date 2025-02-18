import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; 
import { GameProvider } from './pages/lobby_page/GameContext';
import App from './App';
import NavBar from './components/NavBar';
//import ConnectionPage from './pages/connection_page/connection_page';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GameProvider>
    <BrowserRouter>
      <NavBar />
      <App />
    </BrowserRouter>
  </GameProvider>
);
