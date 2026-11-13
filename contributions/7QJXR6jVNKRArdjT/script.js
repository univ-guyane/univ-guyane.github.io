const scene = document.getElementById("scene");
const perso = document.getElementById("perso");

const SOL = 40;          // hauteur du sol en px (doit rester = --sol dans le CSS)
const VITESSE = 3;
const GRAVITE = 0.6;
const SAUT = 11;
const LARGEUR_PERSO = 64;

let x = 0;
let y = 0;               // hauteur au-dessus du sol
let vy = 0;
const touches = { gauche: false, droite: false };

window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) {
    e.preventDefault();  // empêche la page parente de défiler
  }
  if (e.key === "ArrowLeft") touches.gauche = true;
  if (e.key === "ArrowRight") touches.droite = true;
  if ((e.key === "ArrowUp" || e.key === " ") && y === 0) vy = SAUT;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") touches.gauche = false;
  if (e.key === "ArrowRight") touches.droite = false;
});

function boucle() {
  let marche = false;
  if (touches.gauche) { x -= VITESSE; marche = true; perso.classList.add("gauche"); }
  if (touches.droite) { x += VITESSE; marche = true; perso.classList.remove("gauche"); }
  x = Math.max(0, Math.min(x, scene.clientWidth - LARGEUR_PERSO));

  vy -= GRAVITE;
  y += vy;
  if (y <= 0) { y = 0; vy = 0; }

  perso.style.left = x + "px";
  perso.style.bottom = (SOL + y) + "px";

  const auSol = y === 0;
  perso.classList.toggle("walk", marche && auSol);
  perso.classList.toggle("idle", !(marche && auSol));

  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);

/* divers */
const ping = document.getElementById('ping');
setInterval(() => { ping.textContent = 8 + Math.floor(Math.random() * 26); }, 1800);
document.getElementById('an').textContent = new Date().getFullYear();