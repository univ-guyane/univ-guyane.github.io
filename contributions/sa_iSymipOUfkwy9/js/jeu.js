// ===== Déroulement du jeu =====
function lancer() {
  // prépare une œuvre ; ne plante jamais : renvoie { m } ou { e }
  return nouvelleManche(new Set(donnees.serie?.vues)).then(
    (m) => {
      new Image().src = m.image;
      return { m };
    }, // l'image est déjà téléchargée quand on l'affichera
    (e) => ({ e }),
  );
}

async function prochaine() {
  const jeton = ++etat.jeton;
  etat.reessayer = prochaine;
  viderManche();
  chargement("Recherche d'une œuvre…");
  const r = await (etat.suivante ?? lancer());
  if (jeton !== etat.jeton) return; // la série a été terminée entre-temps
  etat.suivante = null;
  if (r.e) {
    cacherChargement();
    alerte(
      "Le musée ne répond pas. Vérifiez votre connexion, puis réessayez.",
      true,
    );
    return;
  }
  masquerAlerte();
  afficher(r.m);
  etat.suivante = lancer(); // pendant que le joueur réfléchit, on prépare déjà la suivante
}

function afficher(m) {
  etat.courante = m;
  donnees.serie.vues.push(m.id);
  etat.indices = melanger(construireIndices(m.objet)).slice(0, MAX_INDICES);
  $("choix").replaceChildren(
    ...fabriquerChoix(m.culture).map((c) => {
      const b = noeud("button", c);
      b.dataset.choix = c;
      return b;
    }),
  );
  majIndice();
  etat.reessayer = chargerImage;
  chargerImage();
}

function chargerImage() {
  masquerAlerte();
  chargement("Chargement de l'image…");
  photo.hidden = true;
  photo.removeAttribute("src");
  photo.src = etat.courante.image;
}
photo.onload = () => {
  cacherChargement();
  photo.hidden = false;
};
photo.onerror = () => {
  cacherChargement();
  alerte("L'image n'a pas pu être chargée. Vérifiez votre connexion.", true);
};

function demanderIndice() {
  if (etat.repondu || etat.utilises >= etat.indices.length) return;
  const i = etat.indices[etat.utilises++];
  const li = noeud("li");
  li.append(noeud("span", i.etiquette, "etiq"), noeud("span", i.texte));
  $("liste-indices").append(li);
  majIndice();
}

function repondre(choix) {
  if (etat.repondu || !etat.courante) return;
  etat.repondu = true;
  const m = etat.courante;
  const bonne = choix === m.culture;
  const points = bonne ? valeur() : 0;
  donnees.serie.total += points;
  donnees.serie.repondues++;
  sauver();

  for (const b of $("choix").children) {
    b.disabled = true;
    if (b.dataset.choix === m.culture) b.classList.add("juste");
    else if (b.dataset.choix === choix) b.classList.add("faux");
  }
  majBarre();
  majIndice();

  const lien = noeud("a", m.lien);
  lien.href = m.lien;
  lien.target = "_blank";
  lien.rel = "noopener noreferrer";
  const suivant = noeud("button", "Œuvre suivante", "principal");
  suivant.onclick = prochaine;
  $("resultat").replaceChildren(
    noeud(
      "p",
      bonne
        ? `Bonne réponse : ${m.culture}. +${points} points.`
        : `Mauvaise réponse. C'était : ${m.culture}. 0 point.`,
      "verdict",
    ),
    noeud("p", [m.titre, m.date].filter(Boolean).join(" — ")),
    lien,
    suivant,
  );
  $("resultat").hidden = false;
  suivant.focus();
}

function nouvelleSerie() {
  donnees.serie = { total: 0, repondues: 0, vues: [] };
  sauver();
  reprendre();
}
function reprendre() {
  etat.suivante = null;
  montrer("jeu");
  majBarre();
  prochaine();
}

function terminer() {
  etat.jeton++; // ignore une œuvre encore en chargement
  etat.suivante = null;
  masquerAlerte();
  const b = cloreSerie();
  if (!b || b.repondues === 0) return accueil();
  $("bilan-texte").textContent =
    `${b.repondues} œuvre${b.repondues > 1 ? "s" : ""}, ${b.total} points, moyenne ${fmt(b.moyenne)} pts.`;
  $("bilan-record").textContent = b.record
    ? "Nouvelle meilleure moyenne."
    : b.repondues < MIN_POUR_RECORD
      ? `Il faut au moins ${MIN_POUR_RECORD} œuvres pour battre la meilleure moyenne.`
      : "";
  remplirStats($("stats-fin"));
  montrer("fin");
}

// ===== Boutons et connexion =====
$("btn-commencer").onclick = nouvelleSerie;
$("btn-continuer").onclick = reprendre;
$("btn-nouvelle").onclick = () => {
  cloreSerie();
  nouvelleSerie();
};
$("btn-rejouer").onclick = nouvelleSerie;
$("btn-terminer").onclick = terminer;
$("btn-indice").onclick = demanderIndice;
$("btn-reessayer").onclick = () => {
  if (etat.reessayer) etat.reessayer();
};
$("choix").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) repondre(b.dataset.choix);
});
window.addEventListener("offline", () =>
  alerte("Connexion interrompue. Le jeu reprendra dès son retour.", false),
);
window.addEventListener("online", () => {
  const relancer = etat.enErreur;
  masquerAlerte();
  if (relancer && etat.reessayer) etat.reessayer();
});

accueil();
