Laetitia TIBERGHIEN\
Erkhem HATANBATAAR VAN\
Léandre GIAMMONA

# Décision du projet

Lors de cette première séance et cette première semaine nous avons décidé de réaliser le jeu nommé _**imposteur**_.\
Le jeu de l'imposteur est un jeu basé sur le bluff et le mensonge, de quoi plaire aux plus fourbes.

### Règles du jeu

Les règles du jeu sont simples :
- Au début de la partie chaque joueur reçoit un mot.
- Tous les joueurs reçoivent le même mot sauf un, **L'IMPOSTEUR**. Ce dernier ne sait pas qu'il est imposteur.

#### Déroulement de la partie :
- Tour à tour les joueurs doivent donner un mot en rapport avec  le mot qu'ils ont reçu.
- Le mot donné par chaque joueur doit être assez pertinnent pour faire comprendre aux autres joueurs qu'ils ne sont pas imposteur mais pas trop explicit pour que l'imposteur ne comprenne pas le mot principal.
- Après que chaque joueur ait donné le nombre de mots qu'il fallait (décidé au début de la partie), passe alors un tour de vote pour que chaque joueur désigne qui il pense être imposteur. 

> Le jeu se base évidemment sur beaucoup d'interractions à l'oral, le site web sera un support pour jouer au jeu.

# Recherches
> - Décision d'utiliser le framework React commme environnement de travail pour le projet: \
> En effet le framework React propose une structure de base dès le démarrage du projet intéréssante, et il présente de nombreux avantages.

## Avantages de React

- Utilisation et création de composants réutilisables. 
  >Par exemple, il est possible de créer un composant Header qui pourra être réutilisé dans plusieurs pages/composants de notre projet pour le réimplémenter facilement.
- Performances pour le DOM optimisées :
  > React utilise un "Virtual DOM" qui permet de mettre à jour uniquement les éléments modifiés d'une page et non la page entière ce qui augmente particulièrement les performances.
- Apprentissage relativement simple :
  > React utilise des fichiers .jsx qui sont un mélange de .js et de .html; le framework a été choisi car ces 2 langages sont relativements simples à apprendre et/ou on déjà été vus de plus ou moins loin par les membres du groupe.
- Hooks et composants :
  > React utilise différents éléments qui sont intéressants que sont les hooks comme useState, useEffect, ou useContext qui permettent de gérer l'état ou le cycle de vie de notre application web, choses qui pouvaient être difficile ou lourdes à faire sans React.\
  > useState permet de gérer l'état d'un composant, useEffect permet d'executer du code à un moment donné, et useContext permet de partager des données entre des composants, ce seront probablement les 3 hooks que nous utiliseront le plus.
- Développement de React et communauté :
  > React est maintenu par meta, l'entreprise de Facebook, et a donc énormement d'utilisateur et de développeurs, donc la communauté est très active et il est très rapide de trouver des solutions ou même de nouvelles idées pour le développement du projet, même sur les réseaux sociaux il est fréquent de trouver des idées.
- React Router :
  > Le React Router permet de gérer efficacement la navigation entre différentes pages.

## Questions à se poser pour le projet
- Comment gérer le système de rooms en temps réel : WebSockets, WebSockets.IO (Node.js), Firebase Realtime Database / Firestore (serverless)
- Sécurité : Éviter qu’un joueur non autorisé rejoigne la partie (clé secrètes, tokens, etc)
- Gestion du cycle de vie :  Que se passe-t-il si l’hôte (celui qui crée la partie) part ? Si un joueur quitte ? Comment communiquer ces changements aux autres ?
  
### Système de rooms en temps réel :

https://developer.mozilla.org/fr/docs/Web/API/WebSockets_API\
https://socket.io/docs/v4/\
https://firebase.google.com/docs\

Pour que chaque joueur voit en direct les changements (vote, distributions, etc), il y a deux grandes approches :

1.  Socket.IO (WebSockets)

> principe : WebSockets permet d’établir une connexion TCP bidirectionnelle persistante entre le client et le serveur. Une fois la connexion établie, les deux parties peuvent envoyer et recevoir des données à tout moment.

>Avantages : Faible latence, communication temps réel, adapté pour des jeux ou applications collaboratives, gérable via un serveur Node.js.

>Implémentation : 
Côté serveur : mise en place d’un serveur Node + Socket.IO.
Côté client : utilisation de la bibliothèque client Socket.IO dans React (avec useEffect pour gérer la connexion/déconnexion).

2. Firebase Realtime Database ou Firestore (serverless)

>**Firebase Realtime Database** : propose une synchronisation temps réel des données entre le client et la base de données. Tout changement dans la base est répercuté instantanément à tous les clients connectés.

>**Firestore** (mode temps réel) : Base de données orientée documents de Firebase, qui propose aussi des mises à jour en temps quasi-réel grâce aux listeners.

>**Avantages** : Aucune gestion de serveur à faire (serverless). Authentification intégrée via Firebase Auth.

>**Inconvénients** : Personnalisation plus limitée qu’avec un serveur Node.js + Socket.IO. Dépendance à un fournisseur Cloud (Firebase), coûts variables selon l’usage.

-> Si on a besoin de haute personnalisation (ex. règles de jeu complexes, logiques de rooms pointues), Socket.IO est souvent préférable.\
-> Si on cherche une solution hébergée, Firebase peut suffire (pour un prototype ou une version simple).

### Sécurité du lobby :

https://en.wikipedia.org/wiki/JSON_Web_Token\
https://jwt.io/\
https://firebase.google.com/docs/auth\

Pour restreindre l’accès à la partie et s’assurer que seuls les joueurs autorisés peuvent rejoindre, on a plusieurs options : 

1. Token “maison” (code d’accès unique)
- **Principe** : l’hôte génère un code d’accès (ex. un identifiant alphanumérique unique) qu’il partage avec les joueurs.

- **Comment faire** : Quand un joueur se connecte, il envoie ce code d'accès. Le serveur vérifie que ce code est valide et que la partie est toujours ouverte.

- **Avantages** : Très simple à mettre en place, rapide pour un MVP.

- **Inconvénients** : Gestion manuelle des codes, pas d’authentification personnalisée par joueur (juste un code commun).

2. JWT (JSON Web Tokens) 

- **JWT** : Système de tokens signés, permettant de vérifier l’identité et les droits de chaque joueur.

- **Principe** : Chaque joueur reçoit un JWT émis par le serveur (Node.js ou autre) ou via un service spécialisé (Auth0, Firebase Auth, etc.). Le client stocke ce token (localStorage, cookie), puis l’envoie à chaque connexion ou requête (Socket.IO, API). Le serveur vérifie la signature du JWT et autorise ou non l’accès.

- **Librairie** (côté serveur Node.js) : 
  - jsonwebtoken
  - passport-jwt

- **Avantages** : Permet de distinguer chaque joueur (chaque token peut contenir un “playerId”, un pseudo etc). Peut être combiné à des règles de roles (admin, host, simple player).

- **Inconvénients** : Nécessite un peu plus de configuration et de mise en place d’un serveur pour émettre/valider les tokens.

3. Bonnes pratiques communes

- **Communication sécurisée (HTTPS)** : Toujours utiliser un certificat SSL pour éviter que les tokens/identifiants ne transitent en clair.

- **Limitation du nombre d’entrées** : Fixer un maximum de joueurs et refuser toute connexion au-delà (pour éviter la surcharge ou l’invasion de bots).

- **Expiration des tokens** : Les JWT ou codes d’accès doivent avoir une durée de vie limitée (ex. 1 heure).

Pour la sécurité nous pourrons donc :
- Commencer avec un code d'accès unique (MVP)
- Puis évoluer vers un système JWT si on a un server Node.js pour vérifier l'identité de chaque joueur voulant rejoindre la partie. (mais implique que chaque joueur puisse être identifiable)
- Ou opter pour Firebase Auth si on veut externaliser la  gestion des comptes mais cela voudrait dire que les joueurs se connectent via le fournisseurs choisi (Google, Facebook, github), (est ce réellement pertinents pour notre jeu ?)

### Gestion du cycle de vie du lobby

https://socket.io/docs/v4/rooms/\
https://firebase.google.com/docs/database/admin/retrieve-data?hl=fr#node.js\
https://firebase.google.com/docs/reference/kotlin/com/google/firebase/firestore/EventListener\
https://firebase.google.com/docs/reference/rest/database?hl=fr#section-streaming\

Pour la gestion du cycle de vie du lobby, on a plusieurs approches possibles : 

1. Gestion côté serveur (Node.js + Socket.O)

- **Node.js** : on code notre propre contrôleurs ou services qui vont définir comment notre lobby passe de l’état ouvert à en cours puis à fermé. L’avantage est d’avoir un point central (le serveur) qui décide quand la partie commence ou se termine et qui gère les transitions d’état.

- **Socket.IO** (ou autre WebSocket) : on envoie des événements (“lobbyCreated”, “gameStarted”, “playerJoined”, “playerLeft”, etc) à tous les clients connectés.

- **Base de données (NoSQL / SQL)** (ou cache (Redis) ?) : Pour garder la liste des lobby et leur statut. Si on utilise Redis, on peut stocker des données éphémères (état d’une partie en cours) et mettre à jour rapidement l’état du lobby.
 Redis stocke les données en mémoire, plutôt que sur un disque ou un disque SSD, ce qui permet d'offrir une vitesse, une fiabilité et des performances inégalées.

Avantages : 
  - Centraliser la logique permet d’éviter les incohérences
  - Contrôler le passage d’un état à un autre

2. Gestion coté serverless (Firebase, Supabase, etc)

- **Firebase Realtime Database** ou **Firestore** : On crée un document “Lobby” contenant le statut du lobby et la liste des joueurs actuellement connectés. On met à jour ce document pour changer l’état du lobby quand l’hôte démarre la partie. Les autres joueurs reçoivent ces changements en temps réel via les listeners Firebase.

- **Cloud Functions** : permet d’automatiser certains passages d’état (ex: fermer automatiquement un lobby après 10 min d’inactivité) et valider les écritures (ex: empêcher un joueur de démarrer la partie s’il n’est pas l’hôte).

Avantages : 
- pas besoin de gérer un serveur Node.js classique.
- Firebase gère nativement l’aspect temps réel et l’infrastructure 
- Contrôles de sécurité (Firestore Rules, etc) pour empêcher des modifications non autorisées de l’état d’un lobby.

Si on utilise déjà un serveur Node.js, il est peut-être intéressant de l’utiliser pour ça aussi ? Sinon on peut aussi faire l’app en 100% serverless ?

>**/!\ gestion du timer dans la partie** : Pour un jeu au tour par tour qui impose une limite de temps à chaque joueur, il est généralement recommandé d’avoir une couche serveur centralisée qui gère et fait autorité sur le timer.

### Gestion du timer
1. avantages du server central
- **source de vérité** : il démarre le décompte, et il est responsable de décréter la fin du temps autorisé. Évite qu’un joueur manipule son horloge locale pour prolonger son tour.
- **Synchronisation pour tous les joueurs** : Les autres joueurs reçoivent en temps réel (via Socket.IO ou équivalent) le temps restant pour la personne dont c’est le tour. Le serveur envoie régulièrement des ticks ou met à jour l’état (ex. 5 secondes restantes, 4, 3…) ou simplement un événement quand le temps est écoulé.
- **Actions automatiques quand le temps expire** : à la fin du timer, le serveur passe au joueur suivant. (envoyer ce que le joueur était en train d’écrire ou simplement ne pas afficher de mot ?)

Exemple de serveur central : Node.js, Nest.js, Express, Koa

2. Mise en place
- **serveur Node.js avec Socket.IO** : Chaque lobby de jeu stocke l’information “joueur en cours”, “temps restant” et “état de la partie”. Lorsque c’est le tour du joueur X, le serveur crée une entrée (ex. remainingTime = 30s).

- **Mécanisme de timer serveur** : Soit un simple setTimeout() pour 30 secondes (par exemple), au bout duquel on exécute la logique de passage au tour suivant. Soit une approche plus robuste (libraries de job scheduling comme Bull ou Agenda) si on a besoin de gérer beaucoup de parties en parallèle ou des actions plus complexes (mais souvent un setTimeout ou un setInterval fait l’affaire pour un prototype).

https://github.com/agenda/agenda\
https://github.com/OptimalBits/bull\

- **événement en temps réel** : Quand le serveur démarre le timer, il envoie un événement Socket.IO avec le temps total (ex: 30 s). À chaque seconde ou toutes les x seconde ou juste à la fin, on peut envoyer un “timerUpdate” pour synchroniser le temps restant sur les clients.

- **expiration du timer** : À la fin du timer, le serveur émet “turnEnded” et détermine qui est le joueur suivant, puis relance un nouveau timer. Les clients reçoivent le nouveau joueur actif et mettent à jour leur interface.

3. Pourquoi pas en serverless ?

C’est souvent plus complexe à synchroniser : 
		
- **Listeners Firebase** : on peut avoir un document “currentTurn” avec un champ “expireAt” (timestamp). Chaque client observe ce document et calcule localement le temps restant. Lorsqu’un client constate que le temps est écoulé, il peut écrire dans la base “end of turn” pour passer la main.
- **Risque de conflits** : plusieurs clients pourraient essayer d’écrire en même temps, et on devra gérer qui a raison (d’où les “transactions” ou “Cloud Functions” pour arbitrer).

- **Cloud Functions programmées** : on peut programmer une Cloud Function qui se déclenche quand on modifie le document “currentTurn” (ex. onWrite) pour démarrer un compte à rebours. Mais les Cloud Functions ne sont pas toujours adaptés à un timer de quelques secondes (latences, coûts, etc.).

>En serverless, c’est réalisable pour des timer “assez longs” (30 secondes à plusieurs minutes) et une logique tolérante au petit décalage. Pour un vrai temps réel réactif à la seconde près (ou quasi seconde), Node.js + Socket.IO reste plus précis et plus simple à gérer.

### Mise en place d'un lien d'invitation

- **Génération d’un code de partie ou d’un lien unique**
- **Redirection** : Quand un joueur clique sur ce lien, il atterrit sur la page lobby “connexion”
- **Vérification** : Au back-end, on récupère l’ID (ex: 12345), on vérifie que la salle existe, qu’elle n’est pas pleine, etc

- **Points d’étude** : (À chercher)
- **UUID (universally unique identifiers)** ou générateur de codes alphanumériques (nanoid en Node.js) pour identifier une partie
- **Paramètres d’URL** : utilisation de react-router pour lire l’ID dans l’URL (useParams())

# Apprentissage
Au cours de cette première semaine de projet, nous nous sommes tous relativement documentés sur l'utilisation et l'implémentation de code avec React, et avons plus ou moins appris les différents points expliqués ci-dessus dans la section Recherches. Il existe énormément de documentation sur https://react.dev ainsi https://reactrouter.com pour l'apprentissage de React.
#### Pour l'instant nous avons majoritairement appris à :
- Faire des implémentations plutôt basiques pour créer une page, pour l'instant, la page de connexion.
- Compris le fonctionnement du DOM avec React
- Compris le fonctionnement des composants réutilisables.

#### Et devons encore apprendre :
- Le fonctionnement des différents hooks.
- Le React Router que nous n'avons pas encore utilisé étant donné que nous n'avons qu'une seule page pour l'instant.