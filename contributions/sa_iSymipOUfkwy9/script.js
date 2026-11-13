// ===== Réglages =====
const BASE = "https://collectionapi.metmuseum.org/public/collection";
const DEPARTEMENTS = [10, 13, 6, 5]; // Égypte ; Grèce et Rome ; Asie ; Afrique, Océanie, Amériques
const DELAI_MAX = 8000; // millisecondes avant d'abandonner une requête
const POINTS_MAX = 100;
const COUT_INDICE = 15;
const MAX_INDICES = 5;
const MIN_POUR_RECORD = 10; // œuvres minimum pour qu'une série puisse devenir la meilleure
const CLE = "provenance"; // nom de la case dans localStorage

// ===== Noms du Met (en anglais) -> libellés français =====
// Une œuvre dont le nom n'est pas dans cette liste est ignorée.
const FR = {
  Greek: "Grèce antique",
  Roman: "Rome antique",
  Etruscan: "Étrurie",
  Cypriot: "Chypre antique",
  Japan: "Japon",
  China: "Chine",
  Chinese: "Chine",
  India: "Inde",
  Tibet: "Tibet",
  Thailand: "Thaïlande",
  Vietnam: "Vietnam",
  Korea: "Corée",
  Cambodia: "Cambodge",
  Nepal: "Népal",
  Pakistan: "Pakistan",
  Myanmar: "Birmanie",
  Indonesia: "Indonésie",
  "Sri Lanka": "Sri Lanka",
  Afghanistan: "Afghanistan",
  Iran: "Iran",
  Mali: "Mali",
  Nigeria: "Nigéria",
  Ghana: "Ghana",
  Benin: "Bénin",
  Cameroon: "Cameroun",
  "Democratic Republic of the Congo": "République démocratique du Congo",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Ivory Coast": "Côte d'Ivoire",
  Ethiopia: "Éthiopie",
  "Burkina Faso": "Burkina Faso",
  Gabon: "Gabon",
  Angola: "Angola",
  Peru: "Pérou",
  Mexico: "Mexique",
  Colombia: "Colombie",
  "Costa Rica": "Costa Rica",
  Guatemala: "Guatemala",
  Ecuador: "Équateur",
  Panama: "Panama",
  Bolivia: "Bolivie",
  "Solomon Islands": "Îles Salomon",
  "Papua New Guinea": "Papouasie-Nouvelle-Guinée",
  Vanuatu: "Vanuatu",
  "New Zealand": "Nouvelle-Zélande",
};
const REPONSES_POSSIBLES = [
  ...new Set(["Égypte antique", ...Object.values(FR)]),
];
// Un indice qui contient un de ces mots donnerait la réponse : on l'écarte.
const FUITES = new RegExp(
  "\\b(" + [...Object.keys(FR), "Egypt", "Hellen"].join("|") + ")",
  "i",
);

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

// ===== API du Met : cache, nouvel essai, délai maximum =====
const ECARTEES = new Set(); // œuvres inutilisables déjà rencontrées (pas de photo, pas libre de droits...)

async function lireJson(url, essais = 2) {
  for (let i = 0; i <= essais; i++) {
    const controle = new AbortController();
    const minuteur = setTimeout(() => controle.abort(), DELAI_MAX);
    try {
      const reponse = await fetch(url, { signal: controle.signal });
      if (!reponse.ok) throw new Error(`Le Met a répondu ${reponse.status}`);
      return await reponse.json();
    } catch (erreur) {
      if (i === essais) throw erreur;
      await pause(500 * (i + 1));
    } finally {
      clearTimeout(minuteur);
    }
  }
}

async function idsDuDepartement(departement) {
  const cle = `met-ids-${departement}`;
  try {
    const gardes = sessionStorage.getItem(cle);
    if (gardes) return JSON.parse(gardes);
  } catch {
    /* pas de cache : on continue */
  }
  const url = `${BASE}/v1.1/search?departmentId=${departement}&isHighlight=true&hasImages=true&q=*`;
  const { objectIDs = [] } = await lireJson(url);
  try {
    sessionStorage.setItem(cle, JSON.stringify(objectIDs));
  } catch {
    /* ignoré */
  }
  return objectIDs;
}

async function nouvelleManche(vues) {
  for (let essai = 0; essai < 10; essai++) {
    const ids = await idsDuDepartement(auHasard(DEPARTEMENTS));
    const restants = ids.filter((id) => !vues.has(id) && !ECARTEES.has(id));
    const id = auHasard(restants.length ? restants : ids); // tout vu : on recommence la liste
    if (!id) continue;
    const objet = await lireJson(`${BASE}/v1/objects/${id}`);
    const culture = trouverCulture(objet);
    if (objet.isPublicDomain && objet.primaryImageSmall && culture) {
      return {
        id,
        culture,
        objet,
        titre: objet.title,
        image: objet.primaryImageSmall,
        date: objet.objectDate,
        lien: objet.objectURL,
      };
    }
    ECARTEES.add(id);
    await pause(150); // on ménage le serveur
  }
  throw new Error("Aucune œuvre exploitable trouvée.");
}

// ===== Réponses et indices =====
function trouverCulture(o) {
  if (o.department === "Egyptian Art") return "Égypte antique"; // champ « culture » vide dans ce département
  const brut = o.country || o.culture || ""; // « Greek, Attic » devient « Greek »
  return (
    FR[
      brut
        .split(",")[0]
        .replace(/\(.*?\)/g, "")
        .trim()
    ] ?? ""
  );
}

function fabriquerChoix(bonne, nombre = 4) {
  const fausses = melanger(REPONSES_POSSIBLES.filter((c) => c !== bonne));
  return melanger([bonne, ...fausses.slice(0, nombre - 1)]);
}

const traduireDate = (d = "") =>
  d
    .replace(/ca\./g, "vers")
    .replace(/B\.C\./g, "av. J.-C.")
    .replace(/A\.D\./g, "apr. J.-C.")
    .replace(/(\d+)(st|nd|rd|th)\b/g, "$1e")
    .replace(/century/g, "siècle")
    .replace(/millennium/g, "millénaire");

// Les indices possibles pour une œuvre : seulement ceux que l'API renseigne et qui ne donnent pas la réponse.
function construireIndices(o) {
  const sources = [
    ["Date", traduireDate(o.objectDate)],
    ["Période", o.period],
    ["Dynastie", o.dynasty],
    ["Matière", o.medium],
    ["Type d'objet", o.objectName],
    ["Titre", o.title],
    ["Artiste", o.artistDisplayName],
    ["Dimensions", o.dimensions],
    ["Thèmes", (o.tags || []).map((t) => t.term).join(", ")],
    ["Entrée au musée", o.accessionYear ? `en ${o.accessionYear}` : ""],
    ["Lieu de découverte", o.locale || o.excavation],
  ];
  const vus = new Set();
  return sources
    .map(([etiquette, v]) => ({ etiquette, texte: String(v || "").trim() }))
    .filter(({ texte }) => {
      const cle = texte.toLowerCase();
      if (!texte || FUITES.test(texte) || vus.has(cle)) return false;
      vus.add(cle);
      return true;
    });
}

// ===== Données gardées dans le navigateur =====
// { series: nombre de séries finies, meilleure: {moyenne, oeuvres} ou null, serie: série en cours ou null }
function lireDonnees() {
  const base = { series: 0, meilleure: null, serie: null };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(CLE)) };
  } catch {
    return base;
  }
}
function sauver() {
  try {
    localStorage.setItem(CLE, JSON.stringify(donnees));
  } catch {
    /* ignoré */
  }
}
let donnees = lireDonnees();

// Termine la série en cours : met à jour la meilleure moyenne et renvoie le bilan.
function cloreSerie() {
  const s = donnees.serie;
  if (!s) return null;
  donnees.serie = null;
  const bilan = {
    total: s.total,
    repondues: s.repondues,
    moyenne: s.repondues ? s.total / s.repondues : 0,
    record: false,
  };
  if (s.repondues > 0) {
    donnees.series++;
    if (
      s.repondues >= MIN_POUR_RECORD &&
      (!donnees.meilleure || bilan.moyenne > donnees.meilleure.moyenne)
    ) {
      donnees.meilleure = { moyenne: bilan.moyenne, oeuvres: s.repondues };
      bilan.record = true;
    }
  }
  sauver();
  return bilan;
}

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
