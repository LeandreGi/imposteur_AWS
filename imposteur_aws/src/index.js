import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ConnectionPage from './pages/connection_page/connection_page';
import HomePage from './pages/HomePage/HomePage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);
