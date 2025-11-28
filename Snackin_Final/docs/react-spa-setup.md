# Installer et exécuter le SPA React avec Laravel (Vite)

Ce document explique comment démarrer l'application en tant que Single-Page Application (SPA) avec React (remplaçant Vue).

Fichiers clés ajoutés / modifiés:
- `resources/js/App.jsx` - point d'entrée React (Router + routes simples)
- `resources/js/components/Home.jsx`, `resources/js/components/About.jsx` - composants demo
- `resources/js/app.js` - monte le `App` React vers `#app`
- `resources/views/monopage.blade.php` - nouvelle vue Blade qui sert l'application SPA et injecte les données d'auth côté serveur
- `vite.config.js` - plugin React (@vitejs/plugin-react) ajouté
- `package.json` - dépendances React et react-router-dom ajoutées

Étapes pour lancer localement (Windows PowerShell):

1) Vérifier Node.js et npm

```powershell
node -v
npm -v
```

Si vous n'avez pas Node/npm, installez-les depuis https://nodejs.org/

2) Installer les dépendances frontend (depuis la racine du projet)

```powershell
cd path\to\Snackin_Final
npm install
```

Si des erreurs apparaissent, essayez dans l'ordre:

```powershell
npm audit fix --force
npm install
```

3) Lancer Vite en mode développement (recompiler automatiquement les assets)

```powershell
npm run dev
```

4) Démarrer le serveur Laravel (nouveau terminal)

```powershell
php artisan serve
```

5) Ouvrez le navigateur sur l'URL indiquée par `php artisan serve` (par défaut http://127.0.0.1:8000). La route SPA `monopage.blade.php` renverra le HTML initial et React prendra le relais côté client.

Notes:
- `window.user_auth_data` est injecté par la vue Blade (`monopage.blade.php`) et contient `{isLoggedin, user}` si l'utilisateur est authentifié.
- Si vous utilisez Laravel avec un preset UI (par exemple `php artisan ui react`), adaptez ces fichiers au preset existant.

Remarque importante sur le routage :
- Le projet SPA a été configuré pour utiliser HashRouter (URLs contenant `#/path`) afin d'éviter les conflits avec les routes existantes côté serveur pendant la migration. Si tu veux des URLs « propres » (sans #), on peut passer à BrowserRouter et migrer/réorganiser les routes serveur pour déléguer la navigation au client.
