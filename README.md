# Info Essoussi

Boutique statique en HTML, CSS et JavaScript. Le catalogue public contient les produits intégrés aux fichiers du site, dont RJ45 (180 DH).

## Publication sur GitHub Pages

1. Crée un dépôt GitHub vide.
2. Depuis ce dossier, initialise Git puis pousse la branche `main` :

```powershell
git init -b main
git add .
git commit -m "Prepare Info Essoussi for GitHub Pages"
git remote add origin https://github.com/TON-COMPTE/TON-DEPOT.git
git push -u origin main
```

3. Dans le dépôt GitHub, ouvre **Settings > Pages** et sélectionne **GitHub Actions** comme source de publication.
4. Le workflow `.github/workflows/pages.yml` publie le site après chaque push vers `main`. L'adresse sera `https://TON-COMPTE.github.io/TON-DEPOT/`.

Les liens entre les pages sont relatifs et fonctionnent avec le sous-chemin GitHub Pages.

## Limites du catalogue

Le dashboard est une maquette locale : ses modifications sont conservées dans `localStorage` du navigateur et ne sont pas publiées pour les visiteurs. Pour publier un nouveau produit, ajoute ses données aux fichiers du catalogue puis pousse la mise à jour sur GitHub. Une gestion partagée et sécurisée nécessite un backend avec une base de données et une authentification.

Le dashboard ne comporte pas de connexion administrateur. Ne stocke pas de données privées dans ce dépôt.
