import { useState } from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleJoinGame = () => {
    if (username.trim().length >= 3) {
      setError('');
      onNavigate('config', { username });
    } else {
      setError('Le pseudo doit contenir au moins 3 caractères');
    }
  };

  const handleCreateGame = () => {
    if (username.trim().length >= 3) {
      setError('');
      onNavigate('config', { username, isPrivate: true });
    } else {
      setError('Le pseudo doit contenir au moins 3 caractères');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black">
  
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>


      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500 mb-4">
            L'IMPOSTEUR
          </h1>
          <p className="text-gray-400 text-lg">Trouvez qui ment parmi vous</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="space-y-6">

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                Votre pseudo
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-800 focus:ring-2 focus:ring-red-900/20 transition-all"
                placeholder="Entrez votre pseudo"
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

          
            <div className="space-y-4">
              <button
                onClick={handleJoinGame}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-800 to-red-900 text-white font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all transform hover:scale-[1.02]"
              >
                Rejoindre une partie
              </button>

              <button
                onClick={handleCreateGame}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 border border-zinc-700 hover:border-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all"
              >
                Créer une partie privée
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;