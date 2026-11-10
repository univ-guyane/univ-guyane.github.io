// ===== Affichage =====
const etat = {
  courante: null,
  indices: [],
  utilises: 0,
  repondu: false,
  suivante: null,
  jeton: 0,
  reessayer: null,
  enErreur: false,
};
const photo = $("photo");

function montrer(nom) {
  for (const n of ["accueil", "jeu", "fin"]) $("ecran-" + n).hidden = n !== nom;
}

function alerte(texte, avecBouton) {
  $("alerte-texte").textContent = texte;
  $("btn-reessayer").hidden = !avecBouton;
  $("alerte").hidden = false;
  etat.enErreur = avecBouton;
}
function masquerAlerte() {
  $("alerte").hidden = true;
  etat.enErreur = false;
}

function chargement(texte) {
  $("msg-chargement").textContent = texte;
  $("chargement").hidden = false;
}
function cacherChargement() {
  $("chargement").hidden = true;
}

function remplirStats(dl) {
  const m = donnees.meilleure;
  const ligne = (nom, valeur) => [
    noeud("dt", nom),
    noeud("dd", String(valeur)),
  ];
  dl.replaceChildren(
    ...ligne(
      "Meilleure moyenne",
      m ? `${fmt(m.moyenne)} pts (${m.oeuvres} œuvres)` : "—",
    ),
    ...ligne("Séries jouées", donnees.series),
  );
}

function accueil() {
  montrer("accueil");
  const s = donnees.serie;
  const enCours = s && s.repondues > 0;
  $("bloc-debut").hidden = enCours;
  $("bloc-reprise").hidden = !enCours;
  if (enCours) {
    $("resume").textContent =
      `Série en cours : ${s.repondues} œuvre${s.repondues > 1 ? "s" : ""}, moyenne ${fmt(s.total / s.repondues)} pts.`;
  }
  remplirStats($("stats"));
}

function majBarre() {
  const s = donnees.serie || { total: 0, repondues: 0 };
  $("num").textContent = `${s.repondues} œuvre${s.repondues > 1 ? "s" : ""}`;
  $("score").textContent =
    `Total ${s.total} · Moyenne ${s.repondues ? fmt(s.total / s.repondues) : "—"}`;
}

const valeur = () => POINTS_MAX - COUT_INDICE * etat.utilises;

function majIndice() {
  const b = $("btn-indice");
  const reste = etat.indices.length - etat.utilises;
  b.disabled = !etat.courante || etat.repondu || reste === 0;
  b.textContent =
    etat.courante && !etat.repondu && reste === 0
      ? "Plus d'indice disponible"
      : `Demander un indice (−${COUT_INDICE} pts)`;
  $("valeur").textContent =
    etat.courante && !etat.repondu
      ? `${valeur()} pts en jeu · indices ${etat.utilises}/${etat.indices.length}`
      : "";
}

function viderManche() {
  Object.assign(etat, {
    courante: null,
    indices: [],
    utilises: 0,
    repondu: false,
  });
  $("choix").replaceChildren();
  $("liste-indices").replaceChildren();
  $("resultat").hidden = true;
  photo.hidden = true;
  majIndice();
}

