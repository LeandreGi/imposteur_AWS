# Node.js

- Fonctionne sur le principe de **Event Loop**, donc en gros Node.js utilise ce qu'on appelle une boucle d'évènements et ça permet de gérer des opérations en arrière-plan et **sans bloquer l'execution du programme**, la boucle d'évènements ne se voit pas pour l'utilisateur donc en gros il n'y a pas d'attente pour l'utilisateur.

- Non Blocking I/O : Node.js peut faire tourner des opérations en simultanées sans que les opérations aient besoin de s'attendre pour s'executer

## Pourquoi pour notre projet ? 
- Pb de temps réel : on avait besoin d'une application qui tourne en temps réel pour envoyer des messages etc donc Node.js était idéal.

- Permet de gérer un grand nombre de connexions : ça s'est jamais vraiment appliqué à notre cas mais Node.js peut gérer un grand nombre de connexions ce qui parraisait important

- Facile à implémenter avec React et Socket.IO : Il y a bcp de docs sur internet qui utilisent React avec Node.js et Socket.io donc le choix paraissait évident.

- permet d'intégrer rapidement des librairies genre express

# React

## Fonctionnement global

### Hooks et composants 

- useState : Gérer l’état local d’un composant (ex. stocker l’état d’un joueur, un compteur de points, etc.).

- useEffect : Gérer les effets de bord et le cycle de vie (ex. effectuer une requête au moment du montage du composant).

- useContext (ou Redux) : Partager un état global (ex. liste des joueurs connectés, état de la partie) entre plusieurs composants.
- Découpage des composants : Séparer la logique (ex. composant “Lobby”, composant “Game”, composant “Login”).

- React Router : Gérer la navigation entre différentes pages (lobby, salle d’attente, page de jeu, page d’erreur).

## Pourquoi pour notre projet ?

Très populaire donc très utilisée donc bcp de doc et de gens qui font des vidéos/des forums etc...

Intéressant pour la gestion des pages etc, pour la réutilisation de composants par exemple pour faire des headers réutilisables etc.
React nous a permis d'avoir une architecture dès le début et de travailler de façon organisée avec des pages de manière logique.
A permis de faire de l'affichage de façon dynamique grâce au langage Javascript.