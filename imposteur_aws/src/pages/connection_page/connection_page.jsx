// ConnectionPage.jsx

import socket from '../socket';
import './connection_page.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function RolesCarousel() {
    const roles = [ 
        {
            id: 1,
            title: 'Les civils',
            description: "Leur but est de découvrir leur propre identité et éliminer l'Imposteur et Mr White.",
            image : '/assets/avatars/Civil.png', 
        },
        {
            id:2,
            title: 'Les imposteurs',
            description: "Leur but est de découvrir leur propre identité et survivre jusqu’à la fin.",
            image : '/assets/avatars/Imposteur.png',
        },
        {
            id:3,
            title: 'Mr. White',
            description: "Son but est de survivre jusqu'à la fin ou de deviner le mot secret des civils.",
            image : '/assets/avatars/MrWhite.png',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNextRole = () => {
        setCurrentIndex((nextIndex) => (nextIndex + 1) % roles.length);
    };

    const goToPreviousRole = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + roles.length) % roles.length);
    };

    const currentRole = roles[currentIndex];

    return (
        <div className="roles_box">
            <h2>Rôles dans le jeu</h2>
            <div className="carousel">
                <div className='carousel_wrapper'>
                    <button onClick = {goToPreviousRole} className="roles_boutons">
                        &lt;
                    </button>

                    <img src={currentRole.image} alt={`Avatar ${currentRole.title}`} className="role_avatar" />
                
                    <button onClick={goToNextRole} className="roles_boutons">
                        &gt;
                    </button>
                </div>
                <div className="roles_txt">
                    <h3 className='highlight_bold'>{currentRole.title}</h3>
                    <p>{currentRole.description}</p>
                </div>
            </div>
        </div>
    );
}

function ConnectionPage() {
    function GameButton() {
        alert('Le jeu va commencer !');
    };
    
    // État pour le pseudo
    const [username, setUsername] = useState('');
    // État pour afficher d’éventuelles erreurs
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [lobbyCode, setLobbyCode] = useState('');

    const handleCreateGame = () => {
        if (username.trim() === '') {
            setError('Veuillez entrer un pseudo.');
            return;
        }
        setError('');

        const generatedLobbyId = Math.floor(1000 + Math.random() * 9000).toString();

        socket.emit('createLobby', { 
            pseudo: username, 
            lobbyId: generatedLobbyId 
        });
    };
    
    const handleJoinGame = () => {
        if (username.trim() === '') {
            setError('Veuillez entrer un pseudo.');
            return;
        }
        if (lobbyCode.trim() === '') {
            setError('Veuillez entrer un code de lobby.');
            return;
        }
        setError('');

        socket.emit('joinLobby', { pseudo: username, lobbyId: lobbyCode });
    };

    // Use effect pour écouter les événements de socket.io
     useEffect(() => {
        socket.on('lobbyData', (data) => {
        // Rediriger vers la page du lobby
          navigate('/lobby', {
            state: {
              username,
              lobbyId: data.lobbyId,
           ...data,
            },
          });
        });

        socket.on('lobbyNotFound', ({ lobbyId }) => {
            setError(`Le lobby avec l'id ${lobbyId} n'existe pas. Voulez-vous créer une partie ?`);
        });

      }, [navigate, username]);

    return (
        <div className="connection_page">
            <div className='page_wrapper'>
                <div className='game_starter'>
                    <div className='logo_box'>
                        <img 
                            src="../assets/logo/logo_txt.png" 
                            alt="Imposteur"
                        />
                    </div>
                    
                    {/* Boutons d’origine */}
                    <button onClick={handleCreateGame}>Créer une partie !</button>
                    <button onClick={handleJoinGame}>Rejoindre une partie !</button>
                    
                    {/* Champ pseudo */}
                    <div>
                        <label htmlFor="username">Votre pseudo</label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Entrez votre pseudo"
                        />
                        {error && <p>{error}</p>}
                    </div>

                    <div>
                        <label htmlFor="lobbyCode">Code du lobby</label>
                        <input
                            type="text"
                            id="lobbyCode"
                            value={lobbyCode}
                            onChange={(e) => setLobbyCode(e.target.value)}
                            placeholder="Ex: 1234"
                        />
                    </div>
                </div>

                <div className='regles_box'>
                    <h2>Règles du jeu</h2>
                    <div className="regles_txt">
                        <p>Le jeu se joue en groupe avec <span className="highlight">au minimum 3 personnes</span>.</p>
                        <p>Au début de la partie, chacun reçoit <span className="highlight">un mot secret</span>. Les joueurs doivent ensuite révéler petit à petit des informations sur leur mot pour deviner qui a <span className="highlight">le même mot</span> qu’eux.</p>
                        <p>Une fois que tout le monde a son rôle (c’est-à-dire connaît son mot), chaque joueur va un à un donner <span className="highlight">un mot clé</span> qui décrit son mot.</p>
                        <p>À la fin du tour, on vote pour <span className="highlight">éliminer la personne la plus suspecte</span>. Quand la personne est éliminée, son rôle est découvert.</p>
                        <p>Si c'est <span className="highlight role">Mr. White</span>, il a une chance de gagner en devinant <span className="highlight">le mot des civils</span>. S’il le découvre, il gagne et <span className="highlight">la partie prend fin</span>, sinon la partie continue.</p>
                        <p><span className="highlight role">Les civils</span> gagnent s’il ne reste qu’eux en jeu. <span className="highlight role">Les Imposteurs</span> et <span className="highlight role">Mr. White</span> gagnent s’il ne reste <span className="highlight">qu’un civil</span> en jeu.</p>
                    </div>
                </div>
                
                <div className="roles_box">
                    <RolesCarousel />
                </div>
            </div>
        </div>
    );
};

export default ConnectionPage;
