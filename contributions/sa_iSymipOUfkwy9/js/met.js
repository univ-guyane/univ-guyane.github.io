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

