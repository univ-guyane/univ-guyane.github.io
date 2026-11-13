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

