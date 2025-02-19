
import socket from '../socket';
import './connection_page.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RolesCarousel() {
    const roles = [ 
        {
            id: 1,
            title: 'Les civils',
            description: "Leur but est de découvrir leur propre identité et éliminer l'Imposteur et Mr White.",
        },
        {
            id:2,
            title: 'Les imposteurs',
            description: "Leur but est de découvrir leur propre identité et survivre jusqu’à la fin.",
        },
        {
            id:3,
            title: 'Mr. White',
            description: "Son but est de survivre jusqu'à la fin ou de deviner le mot secret des civils.",
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
            <button onClick = {goToPreviousRole} className="roles_boutons">
                &lt;
            </button>
            <button onClick={goToNextRole} className="roles_boutons">
                &gt;
            </button>
            <div className="roles_txt">
                <h3>{currentRole.title}</h3>
                <p>{currentRole.description}</p>
            </div>
            
        </div>
    );
}

function ConnectionPage() {
    function GameButton() {
        alert('Le jeu va commencer !');
    };
    
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateGame = () => {
        if (username.trim() === '') {
            setError('Veuillez entrer un pseudo.');
            return;
        }
        setError('');

        const generatedLobbyId = '1234';

        socket.emit('joinLobby', { 
            pseudo: username, 
            lobbyId: generatedLobbyId 
        });

        navigate('/lobby');
    };

    const handleJoinGame = () => {

        // logique pour rejoindre une partie

        if (username.trim() === '') {
            setError('Veuillez entrer un pseudo.');
            return;
        }
        setError('');
        navigate('/lobby');
    };

    return (
        <div className="connection_page">
            <div className='page_wrapper'>
                <div className='game_starter'>
                    <h1>IMPOSTEUR</h1>       
                    <button onClick={handleCreateGame}>Créer une partie !</button>
                    <button onClick={handleJoinGame}>Rejoindre une partie !</button>
                    
                    <div>
                        <label htmlFor="username">
                            Votre pseudo 
                        </label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Entrez votre pseudo"/>
                        {error && <p>{error}</p>}
                    </div>
                </div>

                <div className='regles_box'>
                    <h2>Règles du jeu</h2>
                    <div className='regles_txt'>
                        Le jeu se joue en groupe avec au minimum 3 personnes.
                        Au début de la partie, chacun reçoit un mot secret. Les joueurs doivent ensuite révéler petit à petit des informations sur leur mot pour deviner qui à le même mot qu’eux.
                        Une fois que tout le monde à son rôle (= connait son mot), chaque joueur va un à un donner un mot clé qui décrit son mot. À la fin du tour, on vote pour éliminer la personne la plus suspecte. 
                        Quand la personne est éliminée, sa carte et son rôle sont découvert. Si c'est Mr white, il a une chance de gagner en devinant le mot des civils. S’il le découvre, il gagne et la partie prend fin, sinon la partie continue. 
                        Les civils gagnent s’il ne reste qu’eux en jeu et les Imposteur et Mr. White gagnent s’il ne reste qu’un civil en jeu.
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