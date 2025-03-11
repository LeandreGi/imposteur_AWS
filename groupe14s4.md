Laetitia TIBERGHIEN\
Erkhem HATANBATAAR VAN\
Léandre GIAMMONA\
Mohammed CHAKROUN

# Recherches

## Hébergement sur la plateforme PaaS (Plateform as a Service)

Avec une plateforme PaaS, on pousse notre code(Node.js + front React)  et la plateforme se charge de gérer l’infrastructure : installation, configuration, mise à l’échelle et souvent la gestion SSL (HTTPS). L’application tourne sur un environnement préconfiguré où on a peu à faire côté serveur (mais moins de contrôle sur la machine).

<ins>**Avantages:**</ins>
- **Déploiement simple** : souvent un seul push Git ou une intégration continu (CI)
- **Scalabilité facile** : on ajuste le nombre d'instances en un clic ou via un réglage automatique (auto-scaling)
- **Intégration SSL** : la plupart gèrent automatiquement la configuration HTTPS.
- **Gestion de la base de données** : beaucoup de plateformes PaaS proposent des add-ons (Postgres, MongoDB, Redis, etc.)

<ins>**Inconvénients:**</ins>
- **Coût** : rapidement plus cher qu'une solution auto-hébergée si on a beaucoup d’utilisateurs.
- **Moins de contrôle** : on dépend de la configuration de la plateforme. Difficile de personnaliser certains paramètres de bas niveau.
- **Limitations de Socket.IO** : certaines plateformes imposent des limites sur les connexions WebSockets ou un time-out sur les connexions inactives. Il faut vérifier la compatibilité

Exemple : Heroku, Render, AWS Elastic Beanstalk, Google App Engine, Azure App Service

#### 1. Heroku

https://www.heroku.com/

<ins>**Avantages:**</ins>
- Facilités de déploiement : une simple commande Git (git push heroku main) pour publier
- Intégration continue : Paramétrable avec GitHub pour déployer automatiquement.
- Écosystème d’add-ons : Base de données (PostGres, Redis, etc.) en un clic
- Documentation très accessible : Simple à prendre en, surtout pour un premier projet Node

<ins>**Inconvénients:**</ins>
- Plan gratuit limité : Heroku a réduit ses offres gratuit (elle existe partiellement, mais avec des quotas limités et du “sleep mode” qui met l’app en veille)
- Démarrage lent : En mode gratuit, au premier appel après une période d’inactivité l'application s'active lentement (quelques secondes d’attente)
- Moins adapté aux websockets intensifs : sur le plan gratuit, s’il y a un trafic continu, cela peut bloquer (quotas, timeouts).

=> Idéal pour des petits projets, démonstration de faisabilité, MVP

#### 2. Render

https://render.com/

<ins>**Avantages:**</ins>
- Plan gratuit : Permet d’héberger un service Web Node.js (et parfois un service de base de données) avec des quotas de CPU/mémoire gratuits mensuels (variable)
- Simplicité de configuration : On relie directement un repo GitHub ou GitLab et on déploie automatiquement
- Support de Socket.IO : Render gère les connexions WebSocket sur le port standard de notre application

<ins>**Inconvénients:**</ins>
- Quotas limités : Comme la plupart des services gratuits, on atteint vite la limite d’heures de build ou de CPU si on reçoit beaucoup de requêtes.
- Moins d’add-ons “clef en main” qu’Heroku : On peut se débrouiller avec des services externes, mais c’est moins intégré qu’Heroku
- Possibles temps de “cold start” sur le plan gratuit

=> idéal pour des petites applications Node.js avec un budget nul ou modeste

#### 3. Railway
https://railway.com/

<ins>**Avantages:**</ins> 
- Plan gratuit plutôt bien : souvent suffisant pour un usage de cours ou un petit proof of concept
- Interface moderne : Configuration via dashboard intuitif, logs en direct, etc.
- Base de données intégrée (Postgres, Redis, etc.) parfois incluse dans la free tier.

<ins>**Inconvénients:**</ins>
- Quotas rapidement atteints si l’application reste allumée tout le temps ou si on fait beaucoup de builds/déploiements
- Pas encore aussi établi qu’Heroku ou Render pour les grosses applis (communauté un peu plus réduite, mais en pleine croissance)
- Service encore jeune : évolue vite, ce qui peut être positif ou négatif selon notre besoin de stabilité

=> idéal pour un projet ponctuel puisqu’on utilise pas tellement d’heure ou un usage léger de Node.js / Socket.IO

Comme notre projet n'a pas vocation d’augmenter en utilisateur, il est plus intéressant de privilégier une solution simple et gratuite. Les 3 possibilités citées au dessus sont les plus abordables en termes de coût et de prise en main. Heroku reste le plus répandu pour notre type de projet. Mais si on souhaite tester qlq chose de plus “nouveau” render et railway sont de bonnes alternatives.

## Problèmes de refresh

Lorsqu’on fait un refresh une page, le navigateur réinitialise tout l’état local de l’application front-end (instance Socket.IO côté client, etc.). Par défaut, rien n’est conservé, et côté serveur, Socket.IO perçoit ça comme une déconnexion, suivie d’une nouvelle connexion éventuelle. Cela “casse” donc la session en cours et nous fait perdre le lien avec le lobby / partie.

On peut régler cela de différente manière :

### 1. Stocker un identifiant de session ou de joueur et reconnecter automatiquement

Principe :
Lors de la connexion initiale, on génère un token ou un identifiant unique pour ce joueur (ex.: playerId ou userId, éventuellement signé côté serveur).
L’enregistrer en localStorage, sessionStorage, ou cookie.
À chaque montage du composant React (après un refresh), on relise cet identifiant et on envoie une requête au serveur pour dire “Je reviens avec tel token, puis-je réintégrer le lobby ?”

<ins>**Avantages:**</ins> 
- Confort utilisateur : le joueur retourne dans le même état, comme si rien ne s’était passé.
- Sécurisé si on utilise un vrai token signé (JWT) et que le serveur vérifie toujours son authenticité.

<ins>**Inconvénients:**</ins>
- Nécessite de gérer la persistance côté serveur aussi (qui est ce playerId, dans quel état est-il ?).
- On doit aussi penser à révoquer/mettre à jour le token si le joueur quitte la partie ou si elle est terminée.

### 2. Conserver le lobbyId dans l’URL et réagir coté front

Principe :
En react, on peut inclure le lobbyId dans le pathname (ex. /lobby/1234) ou comme un paramètre de requête. Ainsi, même en cas de refresh, React sait via la route actuelle quel lobby vous cherchez à rejoindre.

<ins>**Avantages:**</ins> 
- Très simple : le paramètre lobbyId existe déjà dans l’URL, pas besoin d’une logique supplémentaire pour le conserver.
- Peut se combiner avec la première solution (token + route param)

<ins>**Inconvénients:**</ins> 
- Ne résout pas à lui seul l’authentification : on sait juste dans quel lobby aller, mais pas nécessairement quelle est l’identité précise du joueur mais comme on vérifie deja pas l'identité au sens large cest pas tres grave.
- Les données sensibles (rôles, scores, etc.) ne devraient pas transiter en clair dans l’URL, même si c’est souvent toléré pour un simple ID de lobby


# Avancées du code
Au cours de cette semaine nous avons pu avancer sur la majorité des choses que nous voulions réaliser.

## Changement automatique d'hôte
L'hôte est initialement le joueur qui a créé le lobby et a donc la main sur les paramètres et a le pouvoir d'arrêter la partie. Il a été fait en sorte que si l'hôte de la partie quitte le lobby, alors ces pouvoirs sont conférés à un autre joueur du lobby.goo

## Gérer les failles au lancement de la partie
Au lancement de la partie nous avions encore quelques problèmes :
- Attribution des rôles
- Affichage des mots et des rôles

Ces problèmes ont été réglés

## Gérer les mots joués au cours de la partie
Durant une partie, les mots joués par des joueurs n'étaient pas affichés sur l'écran des autres joueurs car cette partie n'était pas bien gérée, dorénavant les mots sont gérés côté serveur et donc tous les joueurs voient bien les mots qui ont été joués au cours d'une partie.

## Gérer les tours des joueurs
Comme pour les mots joués au cours d'une partie, lorsqu'un joueur jouait un tour, le passage a un nouveau tour était géré localement pour être ensuite envoyé au server, dorénavant, lorsqu'un joueur joue un tour, le server reçoit une notification immédiatement et **l'attribution des rôles est gérée côté server**.

## Implémentation de la page des votes
Lorsqu'une partie se termine, les joueurs doivent alors voter pour indiquer qui ils pensent coupable.
Une page de vote a donc été implémentée, directement dans la page de jeu **GamePage.jsx** qui existait déjà, l'affichage change selon la phase de jeu dans laquelle on se trouve, nous avons ajouté une variable currentPhase qui change au cours du jeu, selon la valeur de currentPhase, l'affichage change côté client.

## Résumé
L'application tourne quasiment parfaitement, à part quelques petits problèmes évoqués dans la section "A faire" ci-dessous.

# A faire :
## Attribution des points selon les votes
La page des votes a bien été implémentée cependant les scores ne sont pas encore parfaitement calculés pour la page de scores, les règles veulent que : 
- Si un civil vote pour l'imposteur alors il gagne 100 points et l'imposteur 0 point
- Sinon l'imposteur gagne 100 points et le civil 0 point 

## Héberger l'application
Nous devons encore trouver comment héberger notre application et la mettre en ligne.
(cf : Recherches)