const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

const tailleCase = 15;
const colonnes = canvas.width / tailleCase;
const lignes = canvas.height / tailleCase;

let serpent;
let pomme;
let direction;
let prochaineDirection;
let score;
let jeuActif = false;
let boucle;

function nouvellePomme() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * colonnes),
            y: Math.floor(Math.random() * lignes)
        };
    } while (serpent.some(partie => partie.x === position.x && partie.y === position.y));
    return position;
}

function dessiner() {
    ctx.fillStyle = "#101b2c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff6262";
    ctx.beginPath();
    ctx.arc(pomme.x * tailleCase + tailleCase / 2,
            pomme.y * tailleCase + tailleCase / 2,
            tailleCase / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    serpent.forEach((partie, index) => {
        ctx.fillStyle = index === 0 ? "#a7f28d" : "#54c878";
        ctx.fillRect(partie.x * tailleCase + 1, partie.y * tailleCase + 1,
                     tailleCase - 2, tailleCase - 2);
    });
}

function demarrer() {
    clearInterval(boucle);
    serpent = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    direction = { x: 1, y: 0 };
    prochaineDirection = { x: 1, y: 0 };
    score = 0;
    jeuActif = true;
    pomme = nouvellePomme();
    scoreElement.textContent = score;
    messageElement.textContent = "C'est parti !";
    dessiner();
    boucle = setInterval(deplacer, 120);
}

function terminer() {
    jeuActif = false;
    clearInterval(boucle);
    messageElement.textContent = "Perdu ! Score : " + score + ". Clique sur Recommencer.";
}

function changerDirection(x, y) {
    if (!jeuActif) {
        if (messageElement.textContent.startsWith("Appuie")) demarrer();
        else return;
    }
    if (x !== -direction.x || y !== -direction.y) {
        prochaineDirection = { x, y };
    }
}

function deplacer() {
    direction = prochaineDirection;
    const nouvelleTete = { x: serpent[0].x + direction.x, y: serpent[0].y + direction.y };
    const mangePomme = nouvelleTete.x === pomme.x && nouvelleTete.y === pomme.y;
    const corpsAVerifier = mangePomme ? serpent : serpent.slice(0, -1);

    const toucheMur = nouvelleTete.x < 0 || nouvelleTete.x >= colonnes ||
                      nouvelleTete.y < 0 || nouvelleTete.y >= lignes;
    const toucheSerpent = corpsAVerifier.some(
        partie => partie.x === nouvelleTete.x && partie.y === nouvelleTete.y
    );

    if (toucheMur || toucheSerpent) {
        terminer();
        return;
    }

    serpent.unshift(nouvelleTete);
    if (mangePomme) {
        score++;
        scoreElement.textContent = score;
        pomme = nouvellePomme();
        messageElement.textContent = "Bien joué ! Continue.";
    } else {
        serpent.pop();
    }
    dessiner();
}

document.addEventListener("keydown", function(event) {
    const touches = {
        ArrowUp: [0, -1], ArrowDown: [0, 1],
        ArrowLeft: [-1, 0], ArrowRight: [1, 0]
    };
    if (touches[event.key]) {
        event.preventDefault();
        changerDirection(touches[event.key][0], touches[event.key][1]);
    }
});

document.getElementById("up").addEventListener("click", () => changerDirection(0, -1));
document.getElementById("down").addEventListener("click", () => changerDirection(0, 1));
document.getElementById("left").addEventListener("click", () => changerDirection(-1, 0));
document.getElementById("right").addEventListener("click", () => changerDirection(1, 0));
document.getElementById("restart").addEventListener("click", demarrer);

// Affiche le plateau avant le début de la partie.
serpent = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
direction = { x: 1, y: 0 };
prochaineDirection = { x: 1, y: 0 };
score = 0;
pomme = nouvellePomme();
dessiner();
