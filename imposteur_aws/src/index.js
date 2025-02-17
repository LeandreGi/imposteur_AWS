import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ConnectionPage from './pages/connection_page/connection_page';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConnectionPage />
  </React.StrictMode>
);
