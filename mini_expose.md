# Node.js

- Fonctionne sur le principe de **Event Loop**, donc en gros Node.js utilise ce qu'on appelle une boucle d'évènements et ça permet de gérer des opérations en arrière-plan et **sans bloquer l'execution du programme**, la boucle d'évènements ne se voit pas pour l'utilisateur donc en gros il n'y a pas d'attente pour l'utilisateur.

- Non Blocking I/O : Node.js peut faire tourner des opérations en simultanées sans que les opérations aient besoin de s'attendre pour s'executer

## Pourquoi pour notre projet ? 
- Pb de temps réel : on avait besoin d'une application qui tourne en temps réel pour envoyer des messages etc donc Node.js était idéal.

- Permet de gérer un grand nombre de connexions : ça s'est jamais vraiment appliqué à notre cas mais Node.js peut gérer un grand nombre de connexions ce qui parraisait important

- Facile à implémenter avec React et Socket.IO : Il y a bcp de docs sur internet qui utilisent React avec Node.js et Socket.io donc le choix paraissait évident.

- permet d'intégrer rapidement des librairies genre express