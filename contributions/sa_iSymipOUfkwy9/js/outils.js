// ===== Petits outils =====
const $ = (id) => document.getElementById(id);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auHasard = (tableau) =>
  tableau[Math.floor(Math.random() * tableau.length)];
const fmt = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function noeud(balise, texte = "", classe = "") {
  const n = document.createElement(balise);
  n.textContent = texte; // textContent : jamais de HTML venant de l'API
  if (classe) n.className = classe;
  return n;
}

function melanger(tableau) {
  // algorithme de Fisher-Yates
  const t = [...tableau];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

