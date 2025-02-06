import './connection_page.css';

function ConnectionPage() {
    function GameButton() {
        alert('Le jeu va commencer !');
    };

    return (
        <>
            <h1>Le titre de la page</h1>
            <button onClick={GameButton}>Jouer !</button>
        </>
    );
};

export default ConnectionPage;