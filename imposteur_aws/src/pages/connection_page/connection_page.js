import './connection_page.css';
import Header from '../../components/Header/Header';

function ConnectionPage() {
    function GameButton() {
        alert('Le jeu va commencer !');
    };

    return (
        <div classname="connection_page">
            <Header />
            <h1>Le titre de la page</h1>
            <button onClick={GameButton}>Jouer !</button>
        </div>
    );
};

export default ConnectionPage;