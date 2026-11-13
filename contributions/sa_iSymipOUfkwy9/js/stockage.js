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

