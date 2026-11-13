// Génère les petits éléments aléatoires de la scène (herbe, fleurs, eau, étoiles, pétales)

const NS = "http://www.w3.org/2000/svg";

// Générateur pseudo-aléatoire avec graine : la scène est identique à chaque chargement
let graine = 42;
function hasard() {
  graine = (graine * 16807) % 2147483647;
  return (graine - 1) / 2147483646;
}
function entre(min, max) {
  return min + hasard() * (max - min);
}
function choisir(liste) {
  return liste[Math.floor(hasard() * liste.length)];
}

// Crée un élément SVG avec ses attributs et l'ajoute à un parent
function creer(parent, tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const cle in attrs) el.setAttribute(cle, attrs[cle]);
  parent.appendChild(el);
  return el;
}

// Limites de la scène (cf. viewBox="-180 0 1000 420")
const X_MIN = -170;
const X_MAX = 810;

// ---------- Touffes d'herbe ----------
const herbes = document.getElementById("herbes");
for (let i = 0; i < 70; i++) {
  const x = entre(X_MIN, X_MAX);
  const y = entre(135, 198);
  const h = entre(5, 9);
  const d =
    `M${x} ${y} l-3 ${-h * 0.7} ` +
    `M${x} ${y} l0 ${-h} ` +
    `M${x} ${y} l3 ${-h * 0.7}`;
  creer(herbes, "path", { d });
}

// ---------- Petites fleurs ----------
const fleurs = document.getElementById("fleurs");
const couleurs = ["#ffffff", "#ffe066", "#ffb3cf", "#ffd1a1"];
for (let i = 0; i < 22; i++) {
  const x = entre(X_MIN, X_MAX);
  const y = entre(140, 196);
  const couleur = choisir(couleurs);
  const g = creer(fleurs, "g", {});
  // 4 pétales + un coeur jaune
  [[-2.5, 0], [2.5, 0], [0, -2.5], [0, 2.5]].forEach(([dx, dy]) => {
    creer(g, "circle", { cx: x + dx, cy: y + dy, r: 2.2, fill: couleur });
  });
  creer(g, "circle", { cx: x, cy: y, r: 1.6, fill: "#f7a900" });
}

// ---------- Traits blancs qui défilent sur l'eau ----------
const reflets = document.getElementById("reflets");
for (let i = 0; i < 40; i++) {
  const y = entre(232, 410);
  const largeur = entre(14, 55);
  const r = creer(reflets, "rect", {
    class: "reflet",
    x: 0,
    y: y,
    width: largeur,
    height: 2.5,
    rx: 1.2,
  });
  // Plus c'est bas (proche), plus ça va vite
  const duree = 34 - (y - 232) / 10 + entre(-3, 3);
  r.style.animationDuration = duree + "s";
  r.style.animationDelay = -entre(0, duree) + "s";
}

// ---------- Étoiles qui scintillent sur l'eau ----------
const etoiles = document.getElementById("etoiles");
for (let i = 0; i < 30; i++) {
  const cx = entre(X_MIN, X_MAX);
  const cy = entre(235, 405);
  const t = entre(4, 8); // taille de l'étoile
  const p = t * 0.25;
  // Étoile à 4 branches, coordonnées absolues (le CSS gère le scale)
  const d =
    `M${cx} ${cy - t} L${cx + p} ${cy - p} L${cx + t} ${cy} ` +
    `L${cx + p} ${cy + p} L${cx} ${cy + t} L${cx - p} ${cy + p} ` +
    `L${cx - t} ${cy} L${cx - p} ${cy - p} Z`;
  const e = creer(etoiles, "path", { class: "etoile", d });
  const duree = entre(2, 5);
  e.style.animationDuration = duree + "s";
  e.style.animationDelay = -entre(0, duree) + "s";
}

// ---------- Pétales de sakura qui tombent ----------
const petales = document.getElementById("petales");
for (let i = 0; i < 28; i++) {
  const p = creer(petales, "ellipse", {
    class: "petale",
    cx: entre(0, 950),
    cy: 0,
    rx: entre(3, 5),
    ry: entre(2, 3),
  });
  const duree = entre(8, 16);
  p.style.animationDuration = duree + "s";
  p.style.animationDelay = -entre(0, duree) + "s";
}