
/*
   1. RECUPERATION DES ELEMENTS HTML
 */

const gameArea = document.getElementById("game-area");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const hitsDisplay = document.getElementById("hits");
const missesDisplay = document.getElementById("misses");

const accuracyDisplay = document.getElementById("accuracy");
const speedDisplay = document.getElementById("speed");
const recordDisplay = document.getElementById("record-display");

const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const soundButton = document.getElementById("sound-button");

const finalScore = document.getElementById("final-score");
const finalAccuracy = document.getElementById("final-accuracy");
const finalSpeed = document.getElementById("final-speed");
const finalBest = document.getElementById("final-best");

const gameStatus = document.getElementById("game-status");
const progressBar = document.getElementById("progress-bar");


/*
   2. VARIABLES DU JEU
*/

let score = 0;
let hits = 0;
let misses = 0;
let shots = 0;

let timeLeft = 30;
let startTime = 0;

let gameRunning = false;
let soundEnabled = true;

let gameInterval = null;
let movementInterval = null;

let bestScore = loadBestScore();

let audioContext = null;


/*
   3. SAUVEGARDE DU RECORD
 */

function loadBestScore() {

    try {
        return Number(localStorage.getItem("targetShooterBest")) || 0;
    } catch (error) {
        return 0;
    }

}


function saveBestScore() {

    try {
        localStorage.setItem("targetShooterBest", bestScore);
    } catch (error) {
        console.warn("Impossible de sauvegarder le record.");
    }

}


/*
   4. MISE A JOUR DES STATISTIQUES
 */

function updateStats() {

    // Calcul de la précision
    let accuracy;
        if (hits > 0) 
        {
            accuracy = (hits / shots) * 100;
        }
        else
        {
            accuracy = 0;
        }

    // Temps réellement écoulé
    let elapsedTime;

    if (startTime > 0)
    {
        elapsedTime = Math.min((Date.now() - startTime) / 1000, 30)
    }
    else
    {
        elapsedTime = 0;
    }

    // Calcul de la vitesse moyenne
    const speed = elapsedTime > 0
        ? hits / elapsedTime
        : 0;

    // Affichage
    accuracyDisplay.textContent =
        accuracy.toFixed(1) + "%";

    speedDisplay.innerHTML =
        speed.toFixed(2).replace(".", ",") +
        ' <small>cible/s</small>';

    scoreDisplay.textContent = score;
    hitsDisplay.textContent = hits;
    missesDisplay.textContent = misses;

    recordDisplay.textContent = bestScore;

    return {
        accuracy: accuracy,
        speed: speed
    };

}


/*
   5. CREATION DES CIBLES
*/

function createTarget() {

    if (!gameRunning) return;

    const target = document.createElement("div");

    target.classList.add("target");

    // Temps écoulé depuis le début de la partie
    const elapsedTime = (Date.now() - startTime) / 1000;

    // La cible devient progressivement plus petite
    const difficultyLevel = Math.floor(elapsedTime / 5);

    const targetSize = Math.max(
        26,
        52 - difficultyLevel * 4
    );

    target.style.width = targetSize + "px";
    target.style.height = targetSize + "px";

    // Dimensions de la zone de jeu
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    // Position aléatoire
    const randomX = Math.random() * (areaWidth - targetSize);
    const randomY = Math.random() * (areaHeight - targetSize);

    target.style.left = randomX + "px";
    target.style.top = randomY + "px";

    // Clic sur la cible
    target.addEventListener("click", function(event) {

        event.stopPropagation();

        if (!gameRunning) return;

        // Evite plusieurs clics sur la même cible
        if (target.classList.contains("hit")) return;

        shots++;
        hits++;
        score++;

        // Effet visuel
        target.classList.add("hit");

        // Son de réussite
        playSound(650);

        // Arrêt du déplacement de l'ancienne cible
        clearInterval(movementInterval);

        // Mise à jour des statistiques
        updateStats();

        // Création de la cible suivante
        createTarget();

        // Suppression de l'ancienne cible
        setTimeout(function() {
            target.remove();
        }, 200);

    });

    gameArea.appendChild(target);

    // Lancement du déplacement
    moveTarget(target, targetSize);

}


/*
   6. DEPLACEMENT DES CIBLES
*/

function moveTarget(target, targetSize) {

    const elapsedTime = (Date.now() - startTime) / 1000;

    // La cible se déplace de plus en plus rapidement
    const movementSpeed = Math.max(
        600,
        900 - elapsedTime * 18
    );

    movementInterval = setInterval(function() {

        if (!gameRunning || !target.isConnected) {
            clearInterval(movementInterval);
            return;
        }

        const areaWidth = gameArea.clientWidth;
        const areaHeight = gameArea.clientHeight;

        const randomX = Math.random() * (areaWidth - targetSize);
        const randomY = Math.random() * (areaHeight - targetSize);

        target.style.left = randomX + "px";
        target.style.top = randomY + "px";

    }, movementSpeed);

}


/*
   7. GESTION DES CLICS RATES
*/

gameArea.addEventListener("click", function(event) {

    if (!gameRunning) return;

    // Ignore les clics sur les écrans de menu
    if (event.target.closest(".overlay")) return;

    shots++;
    misses++;

    playSound(180);

    updateStats();

});


/*
   8. CHRONOMETRE
*/

function startTimer() {

    gameInterval = setInterval(function() {

        if (!gameRunning) return;

        const elapsedTime = (Date.now() - startTime) / 1000;

        timeLeft = Math.max(0, Math.ceil(30 - elapsedTime));

        timerDisplay.textContent = timeLeft;

        // Barre de progression
        const progress = Math.max(0, 100 - (elapsedTime / 30) * 100);

        progressBar.style.width = progress + "%";

        // Actualisation de la vitesse moyenne
        updateStats();

        if (elapsedTime >= 30) {
            endGame();
        }

    }, 100);

}


/*
   9. DEMARRAGE DE LA PARTIE
*/

function startGame() {

    // Sécurité : arrêt des anciens chronomètres
    clearInterval(gameInterval);
    clearInterval(movementInterval);

    // Suppression des anciennes cibles
    document.querySelectorAll(".target").forEach(target => {
        target.remove();
    });

    // Réinitialisation des variables
    score = 0;
    hits = 0;
    misses = 0;
    shots = 0;

    timeLeft = 30;

    startTime = Date.now();

    gameRunning = true;

    // Réinitialisation de l'interface
    timerDisplay.textContent = timeLeft;
    progressBar.style.width = "100%";

    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");

    gameStatus.classList.add("active");
    gameStatus.lastChild.textContent = " EN COURS";

    updateStats();

    // Première cible
    createTarget();

    // Lancement du chronomètre
    startTimer();

}


/*
   10. FIN DE LA PARTIE
*/

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    // Arrêt des intervalles
    clearInterval(gameInterval);
    clearInterval(movementInterval);

    // Suppression de toutes les cibles
    document.querySelectorAll(".target").forEach(target => {
        target.remove();
    });

    // Mise à jour du record
    if (score > bestScore) {

        bestScore = score;

        saveBestScore();

    }

    // Calcul des statistiques finales
    const stats = updateStats();

    // Affichage du résultat
    finalScore.textContent = score;

    finalAccuracy.textContent =
        stats.accuracy.toFixed(1) + "%";

    finalSpeed.textContent =
        stats.speed.toFixed(2).replace(".", ",") +
        " cible/s";

    finalBest.textContent = bestScore;

    recordDisplay.textContent = bestScore;

    // Affichage de l'écran de fin
    endScreen.classList.remove("hidden");

    // Mise à jour du statut
    gameStatus.classList.remove("active");
    gameStatus.lastChild.textContent = " TERMINÉ";

    timerDisplay.textContent = "0";

    progressBar.style.width = "0%";

}


/*
   11. EFFETS SONORES
*/

function playSound(frequency) {

    if (!soundEnabled) return;

    try {

        // Création du contexte audio
        if (!audioContext) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) return;

            audioContext = new AudioContext();

        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = frequency;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.12,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.12
        );

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.12);

    } catch (error) {

        console.warn("Audio indisponible.");

    }

}


/*
   12. ACTIVATION / DESACTIVATION DU SON
*/

soundButton.addEventListener("click", function() {

    soundEnabled = !soundEnabled;

    soundButton.textContent = soundEnabled
        ? "🔊 Son activé"
        : "🔇 Son désactivé";

    soundButton.setAttribute(
        "aria-pressed",
        soundEnabled
    );

});


/*
   13. EVENEMENTS DES BOUTONS
*/

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);


/* 
    14. INITIALISATION
*/

// Affichage du record sauvegardé
recordDisplay.textContent = bestScore;

updateStats();