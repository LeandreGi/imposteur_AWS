Laetitia TIBERGHIEN\
Erkhem HATANBATAAR VAN\
Léandre GIAMMONA\
Mohammed CHAKROUN

## Recherches

### Socket.io

Comme vu la semaine dernière durant la séance, nous utiliserons pour notre projet Socket.io pour gérer la connexion clients/server.
Nous avons choisi ce framework car nous avions besoin de gérer une connexion en temps réel entre les joueurs socket.io paraît donc idéal.

Les recherches sur socket.io viennent exclusivement du site officiel de la documentation : https://socket.io/

#### Qu'est ce que socket.io
Socket.io est une bibliothèque de JavaScript qui établi une connexion **bidirectionnelle** en temps réel entre le client et le server.
Grâce à Socket.io on peut donc :
- échanger des messages entre les joueurs **instantanément**.
- Mettre à jour l'état du jeu **en temps réel** (si le jeu est fini ou pas, passer au tour de quelqu'un d'autre, commencer la partie...)
- Réagir aux évènement sans avoir besoin de charger la page

#### Apprentissage de socket.io et application
Pour installer socket.io et l'intégrer au projet, il faut d'abord installer les ressources nécéssaires pour l'implémenter dans le server grâce aux commandes :
```npm install socket.io```
```npm install socket.io-client```

On installe donc ce qu'il faut pour le côté server et le côté client.

Une fois ceci fait on peut créer un fichier server.js à la racine du projet pour gérer le server et qu'il puisse "écouter" ce qu'il se passe sur notre application.

```
const { Server } = require("socket.io");
const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`Nouvelle connexion : ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Déconnexion : ${socket.id}`);
  });

});
```
Sur le code ci-dessus on établi donc notre server sur le port 4000 qui écoute notre application qui est par défaut sur le port 3000.

Ensuite, dans le ```/src``` du projet on peut créer un fichier ```socket.js```, ce fichier nous permettra de créer une instance client de socket.io

```
import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

export const socket = io(URL);
```

et enfin dans notre composant principal ```App.js``` on va pouvoir importer le client socket.io pour gérer les évènements de connexion et de déconnexion des clients par exemple.

```
import React, { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Nettoyage des écouteurs lors du démontage du composant
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleConnect = () => {
    socket.connect();
  };

  const handleDisconnect = () => {
    socket.disconnect();
  };

  return (
    <div>
      <p>État de la connexion : {isConnected ? "Connecté" : "Déconnecté"}</p>
      <button onClick={handleConnect} disabled={isConnected}>
        Se connecter
      </button>
      <button onClick={handleDisconnect} disabled={!isConnected}>
        Se déconnecter
      </button>
    </div>
  );
}

export default App;
```

#### Lancer le projet et le server

Une fois que tout est installé on peut alors lancer le projet.
Pour ceci on fait :
- Ouvrir un terminal 
- Se placer dans le dossier du projet ```dossier/du/projet/imposteur_aws```
- Lancer la commande ```node server.js```
- Lancer le projet avec ```npm start```

## Avancée du code
### Pages nécéssaires

Implémentation des croquis des pages pour le projet.
Implémentation des début de pages game_page, lobby_page et score_page en plus de connection_page qui existait déjà pour pouvoir implémenter les routes entre les pages.

### Ajout de style et de fonctionnalités sur certaines pages

Il a été ajouté sur la page de connexion du style et des fonctionnalité, nous avons opté pour un rendu épuré pour l'application (pour le moment du moins) et certaines fonctionnalités, comme des routes vers d'autres pages (voir ci-dessous React Router), l'input pour le pseudo de la partie (avec un message d'alerte si on essaie de créer ou de rejoindre une partie sans avoir créé de pseudo) ,nous pouvons désormais consulter les différents rôles du jeu via des boutons qui défilent, et également l'implémentation d'un début de Header qui servira sur toutes les pages.

### React et les Routes

Les Routes dans React permettent de changer de page d'une manière légèrement différente de l'html.\
En effet, grâce au **React Router**, les composants restent "montés" et seuls les parties du DOM qui doivent être modifiées seront modifiées.\
**Exemple :** Sur un site web on affiche sur toutes nos pages, le Header et le Footer qui sont définis en tant que composants fixes (qui contiennent des navbars, des logos, des liens etc...). Une partie de nos pages ne change donc jamais, le **React Rooter** permet donc de, lorsqu'un veut changer de page, ne changer que les parties de pages qui demandent d'être changées, dans notre cas, le Header et le Footer ne changeront donc jamais et on économise alors des ressources et de bande passant à chaque fois par rapport à du html classique.

### Socket.io

Implémentation des premiers fichiers de base pour socket.io comme explique ci-dessus dans la section **Socket.io**