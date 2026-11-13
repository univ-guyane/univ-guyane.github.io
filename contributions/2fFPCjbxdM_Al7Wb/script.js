
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");

const W = canvas.width;
const H = canvas.height;

let camera = 0;
let score = 0;
let lives = 3;
let levelIndex = 0;
let keys = {};
let gameState = "playing";
let worldWidth = 2500;

const player = {
  x: 80, y: 344, w: 30, h: 46,
  vx: 0, vy: 0,
  speed: 4, jump: -12,
  grounded: false, facing: 1
};

// Chaque niveau possède son propre décor et ses plateformes.
const levels = [
  {
    name: "La forêt magique",
    sky1: "#79c9d3",
    sky2: "#d4efb0",
    ground: "#704b32",
    grass: "#55a844",
    trees: "#237c4c",
    platforms: [
      {x:0,y:390,w:600,h:60},
      {x:680,y:390,w:420,h:60},
      {x:1180,y:390,w:450,h:60},
      {x:1710,y:390,w:790,h:60},
      {x:300,y:300,w:130,h:20},
      {x:800,y:300,w:130,h:20},
      {x:1250,y:290,w:150,h:20},
      {x:1800,y:290,w:150,h:20},
      {x:2150,y:300,w:130,h:20}
    ],
    enemies: [
      {x:400,min:350,max:550},
      {x:900,min:720,max:1050},
      {x:1400,min:1220,max:1580},
      {x:2050,min:1750,max:2400}
    ],
    coins: [220,350,500,750,850,1000,1250,1350,1500,1800,1900,2100,2250,2400]
  },
  {
    name: "La vallée des cascades",
    sky1: "#72b9e8",
    sky2: "#c5eaff",
    ground: "#62523f",
    grass: "#45a78b",
    trees: "#176d68",
    platforms: [
      {x:0,y:390,w:500,h:60},
      {x:580,y:350,w:330,h:100},
      {x:1000,y:390,w:350,h:60},
      {x:1450,y:340,w:350,h:110},
      {x:1900,y:390,w:600,h:60},
      {x:250,y:280,w:130,h:20},
      {x:700,y:240,w:130,h:20},
      {x:1100,y:280,w:130,h:20},
      {x:1550,y:230,w:140,h:20},
      {x:2050,y:290,w:140,h:20}
    ],
    enemies: [
      {x:300,min:100,max:450},
      {x:700,min:600,max:850},
      {x:1200,min:1050,max:1300},
      {x:2100,min:1950,max:2400}
    ],
    coins: [150,280,380,650,750,850,1050,1150,1300,1500,1600,1750,2000,2150,2300]
  },
  {
    name: "Le royaume des montagnes",
    sky1: "#8b9bd8",
    sky2: "#f3c6ad",
    ground: "#59465b",
    grass: "#8caa4e",
    trees: "#496b50",
    platforms: [
      {x:0,y:390,w:450,h:60},
      {x:530,y:340,w:300,h:110},
      {x:920,y:390,w:330,h:60},
      {x:1340,y:320,w:320,h:130},
      {x:1750,y:390,w:300,h:60},
      {x:2140,y:340,w:360,h:110},
      {x:220,y:280,w:130,h:20},
      {x:650,y:230,w:130,h:20},
      {x:1050,y:280,w:130,h:20},
      {x:1450,y:210,w:140,h:20},
      {x:1850,y:280,w:130,h:20},
      {x:2250,y:230,w:140,h:20}
    ],
    enemies: [
      {x:250,min:100,max:400},
      {x:650,min:550,max:800},
      {x:1100,min:950,max:1200},
      {x:1500,min:1380,max:1600},
      {x:2250,min:2180,max:2450}
    ],
    coins: [150,280,380,600,700,800,980,1100,1200,1400,1500,1600,1800,1900,2200,2300,2400]
  }
];

let platforms = [];
let coins = [];
let enemies = [];
let trees = [];
let particles = [];

function roundedRect(x,y,w,h,r,color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  ctx.fill();
}

function loadLevel(index) {
  const level = levels[index];

  worldWidth = 2500;
  platforms = level.platforms.map(p => ({...p}));

  coins = level.coins.map(x => ({
    x, y: 230 + Math.sin(x / 100) * 45, taken: false
  }));

  enemies = level.enemies.map(e => ({
    x: e.x, y: 362, w: 34, h: 28,
    min: e.min, max: e.max,
    speed: 1.2 + Math.random() * 0.5,
    direction: 1,
    alive: true
  }));

  trees = [];
  for (let i = 0; i < 38; i++) {
    trees.push({
      x: i * 85 + Math.random() * 35,
      size: 70 + Math.random() * 80
    });
  }

  particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5
    });
  }

  player.x = 80;
  player.y = 344;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;

  camera = 0;
  gameState = "playing";
}

function drawBackground() {
  const level = levels[levelIndex];

  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,level.sky1);
  sky.addColorStop(1,level.sky2);
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,W,H);

  // Soleil
  ctx.fillStyle = "#fff4a8";
  ctx.beginPath();
  ctx.arc(730,75,38,0,Math.PI*2);
  ctx.fill();

  // Montagnes
  for (let i=0; i<8; i++) {
    let x = i*190 - (camera*0.15)%190;
    ctx.fillStyle = i%2 ? "#659b91" : "#79ac9a";
    ctx.beginPath();
    ctx.moveTo(x-80,330);
    ctx.lineTo(x+70,105);
    ctx.lineTo(x+230,330);
    ctx.fill();
  }

  // Collines au loin
  for (let i=0; i<30; i++) {
    let x = (i*110-camera*0.35)%1100;
    ctx.fillStyle = level.trees;
    ctx.beginPath();
    ctx.arc(x,280,75,Math.PI,0);
    ctx.fill();
  }

  // Rayons lumineux
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff9c9";
  for (let i=0; i<6; i++) {
    ctx.beginPath();
    ctx.moveTo(i*180,0);
    ctx.lineTo(i*180+80,0);
    ctx.lineTo(i*180+220,390);
    ctx.lineTo(i*180+140,390);
    ctx.fill();
  }
  ctx.restore();
}

function drawTrees() {
  trees.forEach(tree => {
    let x = tree.x-camera*0.7;
    if (x < -120 || x > W+120) return;

    roundedRect(x-tree.size*0.1,300-tree.size*0.8,
      tree.size*0.2,tree.size,8,"#68472e");

    ctx.fillStyle = levels[levelIndex].trees;
    ctx.beginPath();
    ctx.arc(x,280-tree.size*0.7,tree.size*0.48,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#43a65e";
    ctx.beginPath();
    ctx.arc(x-tree.size*0.16,275-tree.size*0.7,
      tree.size*0.22,0,Math.PI*2);
    ctx.fill();
  });
}

function drawGround() {
  platforms.forEach(p => {
    let x = p.x-camera;
    if (x+p.w < 0 || x > W) return;

    roundedRect(x,p.y,p.w,p.h,8,levels[levelIndex].ground);
    roundedRect(x,p.y,p.w,12,5,levels[levelIndex].grass);

    ctx.fillStyle = "#a0d66a";
    for (let i=0; i<p.w; i+=24) {
      ctx.fillRect(x+i,p.y+10,9,4);
    }
  });
}

function drawPlayer() {
  let x = player.x-camera;
  let y = player.y;

  ctx.save();

  if (player.facing === -1) {
    ctx.translate(x+player.w/2,0);
    ctx.scale(-1,1);
    ctx.translate(-(x+player.w/2),0);
  }

  // Sac à dos
  roundedRect(x-7,y+17,12,20,5,"#80502d");

  // Jambes
  roundedRect(x+4,y+32,9,13,3,"#4d7844");
  roundedRect(x+17,y+32,9,13,3,"#4d7844");

  // Bottes
  roundedRect(x+1,y+41,14,6,3,"#60402c");
  roundedRect(x+16,y+41,14,6,3,"#60402c");

  // Veste
  roundedRect(x+3,y+16,25,23,7,"#398b55");

  // Ceinture
  ctx.fillStyle = "#b78a45";
  ctx.fillRect(x+5,y+33,21,4);

  // Visage
  roundedRect(x+5,y+3,22,19,7,"#f0bd8b");

  // Capuche
  ctx.fillStyle = "#23764b";
  ctx.beginPath();
  ctx.arc(x+16,y+7,14,Math.PI,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#f0bd8b";
  ctx.fillRect(x+5,y+8,22,9);

  // Yeux
  ctx.fillStyle = "#222";
  ctx.fillRect(x+11,y+12,3,4);
  ctx.fillRect(x+21,y+12,3,4);

  // Mèche
  ctx.fillStyle = "#513a29";
  ctx.fillRect(x+8,y+5,12,3);

  ctx.restore();
}

// Ennemis champignons originaux
function drawEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;

    const x = e.x-camera;
    if (x < -50 || x > W+50) return;

    // Pied
    roundedRect(x+8,e.y+13,18,15,7,"#f4d5a6");

    // Chapeau
    ctx.fillStyle = "#a94d79";
    ctx.beginPath();
    ctx.arc(x+17,e.y+13,18,Math.PI,0);
    ctx.fill();

    // Points du chapeau
    ctx.fillStyle = "#fff0d8";
    ctx.beginPath();
    ctx.arc(x+9,e.y+6,3,0,Math.PI*2);
    ctx.arc(x+24,e.y+6,3,0,Math.PI*2);
    ctx.fill();

    // Yeux
    ctx.fillStyle = "#302536";
    ctx.fillRect(x+11,e.y+19,3,4);
    ctx.fillRect(x+22,e.y+19,3,4);
  });
}

function drawCoins() {
  coins.forEach(c => {
    if (c.taken) return;

    let x = c.x-camera;
    if (x < -30 || x > W+30) return;

    let pulse = 0.8 + Math.abs(Math.sin(Date.now()/180))*0.2;

    ctx.save();
    ctx.translate(x,c.y);
    ctx.scale(pulse,1);

    ctx.fillStyle = "#ffd84a";
    ctx.beginPath();
    ctx.arc(0,0,10,0,Math.PI*2);
    ctx.fill();

    ctx.strokeStyle = "#fff4a0";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  });
}

function drawWaterfall() {
  if (levelIndex !== 1) return;

  const x = 1500-camera;
  const top = 240;
  const bottom = 390;
  const time = Date.now()/100;

  const water = ctx.createLinearGradient(x,top,x+80,top);
  water.addColorStop(0,"#168fc0");
  water.addColorStop(0.5,"#8beaff");
  water.addColorStop(1,"#168fc0");

  ctx.fillStyle = water;
  ctx.fillRect(x,top,80,bottom-top);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x,top,80,bottom-top);
  ctx.clip();

  for (let i=0; i<9; i++) {
    const streamY = top+((time*3+i*24)%160);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(x+8+i*9,streamY,3,35);
  }

  ctx.restore();

  ctx.fillStyle = "#168fc0";
  ctx.beginPath();
  ctx.ellipse(x+40,bottom,65,12,0,0,Math.PI*2);
  ctx.fill();
}

function drawFinishFlag() {
  const x = worldWidth-120-camera;

  // Poteau
  ctx.fillStyle = "#eee8d5";
  ctx.fillRect(x,220,8,170);

  // Drapeau
  ctx.fillStyle = "#ffcc45";
  ctx.beginPath();
  ctx.moveTo(x+8,225);
  ctx.lineTo(x+75,245);
  ctx.lineTo(x+8,270);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x+8,215,8,0,Math.PI*2);
  ctx.fill();
}

function drawParticles() {
  particles.forEach(p => {
    p.x -= p.speed;
    if (p.x < 0) p.x = W;
    p.y += Math.sin(Date.now()/700+p.x)*0.15;

    ctx.fillStyle = "rgba(255,255,190,0.75)";
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });
}

function drawHUD() {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(15,12,250,65);

  ctx.fillStyle = "white";
  ctx.font = "bold 17px Arial";
  ctx.fillText("Niveau " + (levelIndex+1) + " : " + levels[levelIndex].name,25,38);
  ctx.fillText("Vies : " + "❤️".repeat(lives),25,63);
}

function drawMessage(title,subtitle) {
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0,0,W,H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 42px Arial";
  ctx.fillText(title,W/2,H/2-25);

  ctx.font = "20px Arial";
  ctx.fillText(subtitle,W/2,H/2+25);
  ctx.textAlign = "left";
}

function update() {
  if (gameState !== "playing") return;

  // Déplacement
  if (keys.ArrowRight || keys.d) {
    player.vx = player.speed;
    player.facing = 1;
  } else if (keys.ArrowLeft || keys.q) {
    player.vx = -player.speed;
    player.facing = -1;
  } else {
    player.vx *= 0.75;
  }

  // Saut
  if ((keys[" "] || keys.ArrowUp) && player.grounded) {
    player.vy = player.jump;
    player.grounded = false;
  }

  player.x += player.vx;
  player.x = Math.max(0,Math.min(worldWidth-player.w,player.x));

  const oldBottom = player.y+player.h;

  player.vy += 0.55;
  player.y += player.vy;
  player.grounded = false;

  // Collision avec les plateformes
  platforms.forEach(p => {
    if (
      player.x+player.w > p.x &&
      player.x < p.x+p.w &&
      oldBottom <= p.y+8 &&
      player.y+player.h >= p.y &&
      player.vy >= 0
    ) {
      player.y = p.y-player.h;
      player.vy = 0;
      player.grounded = true;
    }
  });

  // Récupération des pièces
  coins.forEach(c => {
    if (!c.taken &&
      player.x+player.w > c.x-10 &&
      player.x < c.x+10 &&
      player.y+player.h > c.y-10 &&
      player.y < c.y+10
    ) {
      c.taken = true;
      score += 10;
      scoreText.textContent = score;
    }
  });

  // Déplacement et contact avec les ennemis
  enemies.forEach(e => {
    if (!e.alive) return;

    e.x += e.speed*e.direction;

    if (e.x < e.min || e.x > e.max) {
      e.direction *= -1;
    }

    const touching =
      player.x+player.w > e.x &&
      player.x < e.x+e.w &&
      player.y+player.h > e.y &&
      player.y < e.y+e.h;

    if (touching) {
      // Sauter sur l'ennemi permet de le battre
      if (player.vy > 0 && oldBottom <= e.y+12) {
        e.alive = false;
        player.vy = -8;
        score += 20;
        scoreText.textContent = score;
      } else {
        loseLife();
      }
    }
  });

  // Chute dans le vide
  if (player.y > H+100) {
    loseLife();
  }

  // Arrivée au drapeau
  if (player.x+player.w >= worldWidth-125) {
    gameState = "levelComplete";
  }

  camera = Math.max(0,Math.min(worldWidth-W,player.x-W*0.38));
}

function loseLife() {
  lives--;

  if (lives <= 0) {
    gameState = "gameOver";
    return;
  }

  player.x = 80;
  player.y = 344;
  player.vx = 0;
  player.vy = 0;
  camera = 0;
}

function nextLevel() {
  if (levelIndex < levels.length-1) {
    levelIndex++;
    loadLevel(levelIndex);
  } else {
    gameState = "gameWon";
  }
}

function draw() {
  drawBackground();
  drawTrees();
  drawWaterfall();
  drawGround();
  drawCoins();
  drawEnemies();
  drawFinishFlag();
  drawPlayer();
  drawParticles();
  drawHUD();

  if (gameState === "levelComplete") {
    drawMessage("Niveau terminé !", "Appuie sur ENTRÉE pour continuer");
  }

  if (gameState === "gameOver") {
    drawMessage("Partie terminée", "Appuie sur ENTRÉE pour recommencer");
  }

  if (gameState === "gameWon") {
    drawMessage("BRAVO !", "Tu as terminé les 3 niveaux ! Appuie sur ENTRÉE");
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", e => {
  if (["ArrowLeft","ArrowRight","ArrowUp"," "].includes(e.key)) {
    e.preventDefault();
  }

  keys[e.key] = true;

  if (e.key === "Enter") {
    if (gameState === "levelComplete") {
      nextLevel();
    } else if (gameState === "gameOver") {
      lives = 3;
      score = 0;
      scoreText.textContent = score;
      levelIndex = 0;
      loadLevel(0);
    } else if (gameState === "gameWon") {
      lives = 3;
      score = 0;
      scoreText.textContent = score;
      levelIndex = 0;
      loadLevel(0);
    }
  }
});

window.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// Lancement du premier niveau
loadLevel(0);
loop();
// Commandes tactiles pour téléphone et tablette
function setupTouchButton(buttonId, key) {
  const button = document.getElementById(buttonId);

  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    keys[key] = true;
  });

  function release() {
    keys[key] = false;
  }

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("pointerleave", release);
}

setupTouchButton("left", "ArrowLeft");
setupTouchButton("right", "ArrowRight");
setupTouchButton("jump", " ");
