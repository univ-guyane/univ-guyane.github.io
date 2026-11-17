const target = document.getElementById("target");
const gameArea = document.getElementById("gameArea");

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

const startButton = document.getElementById("start");
const message = document.getElementById("message");
const result = document.getElementById("result");

let score = 0;
let time = 30;
let gameRunning = false;
let timer;

function moveTarget() {

    const maxX = gameArea.clientWidth - target.offsetWidth;
    const maxY = gameArea.clientHeight - target.offsetHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    target.style.left = x + "px";
    target.style.top = y + "px";
}

function startGame() {

    score = 0;
    time = 30;
    gameRunning = true;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = time;

    result.textContent = "";

    message.style.display = "none";
    target.style.display = "block";

    moveTarget();

    clearInterval(timer);

    timer = setInterval(() => {

        time--;

        timeDisplay.textContent = time;

        if (time <= 0) {
            endGame();
        }

    }, 1000);
}

function endGame() {

    gameRunning = false;

    clearInterval(timer);

    target.style.display = "none";
    message.style.display = "flex";

    message.querySelector("h2").textContent = "⏰ Temps écoulé !";

    startButton.textContent = "REJOUER";

    result.textContent = "🏆 Ton score : " + score;
}

target.addEventListener("click", () => {

    if (!gameRunning) return;

    score++;

    scoreDisplay.textContent = score;

    moveTarget();
});

startButton.addEventListener("click", startGame);
