
const canvas = document.querySelector("#jeu");
const ctx = canvas.getContext("2d");

const message = document.querySelector("#message");
const affichageCle = document.querySelector("#cle");
const boutonRecommencer = document.querySelector("#recommencer");
const taille = 40;
const colonnes = 15;
const lignes = 11;

let joueur = { x: 1, y: 1 };
let monstre = { x: 7, y: 5 };
let cle = { x: 1, y: 1 };
let sortie = { x: 13, y: 9 };
let possedeCle = false;
let termine = false;
let labyrinthe = [];

function genererLabyrinthe() {
    labyrinthe = [];
    for (let y = 0; y < lignes; y++) {
        labyrinthe[y] = [];
        for (let x = 0; x < colonnes; x++) {
            if (x === 0 || y === 0 ||
               x === colonnes - 1 || y === lignes - 1) {
                labyrinthe[y][x] = 1;
          } else {
           labyrinthe[y][x] = Math.random() < 0.28 ? 1 : 0;
            }
        } }
    for (let x = 1; x <= 13; x++) {
        labyrinthe[1][x] = 0; }

    for (let y = 1; y <= 9; y++) {
        labyrinthe[y][13] = 0;}
    joueur = { x: 1, y: 1 };
    sortie = { x: 13, y: 8 };
    cle = {
        x: Math.floor(Math.random() * 11) + 2,
        y: 1};

    monstre = { x: 7, y: 5 };
    while (labyrinthe[monstre.y][monstre.x] === 1 ||
           (monstre.x === joueur.x && monstre.y === joueur.y)) {

        monstre.x = Math.floor(Math.random() * 13) + 1;
        monstre.y = Math.floor(Math.random() * 9) + 1;}

    possedeCle = false;
    termine = false;
message.textContent = "trouve la cle et rejoins la sortie ";
affichageCle.textContent = "Clé : non trouve";

    dessiner();}
function dessiner() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < lignes; y++) {

        for (let x = 0; x < colonnes; x++) {

            if (labyrinthe[y][x] === 1) {
                ctx.fillStyle = "#26352c";
            } else {
                ctx.fillStyle = "#e8eee9";
            }

            ctx.fillRect(
                x * taille,
                y * taille,
                taille,
                taille
            );

        }
    }

    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (!possedeCle) {
        ctx.fillText("🔑",
            cle.x * taille + taille / 2,
            cle.y * taille + taille / 2);}
    ctx.fillStyle = possedeCle ? "green" : "red";
    ctx.fillRect(
        sortie.x * taille + 5,
        sortie.y * taille + 5,
        taille - 10,
        taille - 10
    );
    ctx.fillText("👾",
        monstre.x * taille + taille / 2,
        monstre.y * taille + taille / 2);
    ctx.fillText("🧍",
        joueur.x * taille + taille / 2,
        joueur.y * taille + taille / 2);}
function deplacerJoueur(dx, dy) {
    if (termine) {
        return;d}

    let nouveauX = joueur.x + dx;
    let nouveauY = joueur.y + dy;
    if (labyrinthe[nouveauY][nouveauX] === 1) {
        return;
    }
    joueur.x = nouveauX;
    joueur.y = nouveauY;
    if (joueur.x === cle.x && joueur.y === cle.y) {

        possedeCle = true;
        affichageCle.textContent = "Clé : trouvée !";
        message.textContent = "Tu as la clé  Trouve la sortie ";}
    if (joueur.x === sortie.x && joueur.y === sortie.y) {

        if (possedeCle) {
            message.textContent = "bravo  Tu as gage";
            termine = true;
        } else {
            message.textContent = "Il te faut la cle pour sortir ";
        }}
    verifierMonstre();
    dessiner();}
document.addEventListener("keydown", function(event) {

    if (event.key === "ArrowUp" || event.key === "z") {
        deplacerJoueur(0, -1);   }

    if (event.key === "ArrowDown" || event.key === "s") {
        deplacerJoueur(0, 1);  }

    if (event.key === "ArrowLeft" || event.key === "q") {
        deplacerJoueur(-1, 0);  }

    if (event.key === "ArrowRight" || event.key === "d") {
        deplacerJoueur(1, 0); }});

function deplacerMonstre() {

    if (termine) {
        return; }

    let directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    // Choisir une direction aléatoire
    let direction = directions[
        Math.floor(Math.random() * directions.length)
    ];

    let nouveauX = monstre.x + direction.x;
    let nouveauY = monstre.y + direction.y;
    if (labyrinthe[nouveauY][nouveauX] === 0) {
        monstre.x = nouveauX;
        monstre.y = nouveauY; }

    verifierMonstre();
    dessiner();}
function verifierMonstre() {
    if (joueur.x === monstre.x &&
        joueur.y === monstre.y) {
        message.textContent = "Le monstre t'a attrapé !";
        termine = true; }}
boutonRecommencer.addEventListener("click", genererLabyrinthe);
genererLabyrinthe();

setInterval(deplacerMonstre, 50);
