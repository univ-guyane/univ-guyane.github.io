const images = [
    {
        chemin: "images/Pomme verte.png",
        couleurs: ["vert"]
    },
    {
        chemin: "images/Goutte d'eau.png",
        couleurs: ["bleu"]
    },
    {
        chemin: "images/Coeur violet.png",
        couleurs: ["violet"]
    },
    {
        chemin: "images/Chat rouge.png",
        couleurs: ["rouge", "blanc"]
    },
    {
        chemin: "images/Pizza.png",
        couleurs: ["jaune-orange", "rouge"]
    },
    {
        chemin: "images/Soleil.png",
        couleurs: ["rose", "violet"]
    },
    {
        chemin: "images/Chocolat.png",
        couleurs: ["blanc", "marron"]
    },
    {
        chemin: "images/Fleur.png",
        couleurs: ["rose", "vert"]
    },
    {
        chemin: "images/Voiture.png",
        couleurs: ["noir", "gris"]
    },
    {
        chemin: "images/Chaussure.png",
        couleurs: ["rouge", "blanc"]
    }
];
let imageActuelle = 0;
let partieTerminee = false;
const affichageImage = document.getElementById("image-jeu");
affichageImage.src = images[imageActuelle].chemin;
const boutonValider = document.getElementById("valider");
const affichageResultat = document.getElementById("resultat");
const boutonRecommencer = document.getElementById("recommencer");
let score = 0;
let reponseValidee = false;
const affichageScore = document.getElementById("score");

console.log(boutonValider);
function recommencerPartie() {
    imageActuelle = 0;
    score = 0;
    partieTerminee = false;
    reponseValidee = false;
    affichageImage.style.display = "inline";
    document.getElementById("couleurs").style.display = "block";
    boutonValider.style.display = "inline-block";
    boutonRecommencer.hidden = true;
    affichageScore.textContent = "Score : 0";
    const casesCouleurs = document.querySelectorAll('#couleurs input');

casesCouleurs.forEach(function(caseCouleur) {
    caseCouleur.checked = false;
});
    document.getElementById("resultat").textContent = "";
    affichageImage.src = images[imageActuelle].chemin;
}
function imageSuivante() {
    imageActuelle = imageActuelle + 1;

    if (imageActuelle < images.length) {
        affichageImage.src = images[imageActuelle].chemin;
        reponseValidee = false;
        document.getElementById("resultat").textContent = "";
        const casesCouleurs = document.querySelectorAll(
    '#couleurs input'
);

casesCouleurs.forEach(function(caseCouleur) {
    caseCouleur.checked = false;
});
    } else {
        partieTerminee = true;
        affichageImage.style.display = "none";
        document.getElementById("couleurs").style.display = "none";
        boutonValider.style.display = "none";
        boutonRecommencer.hidden = false;
        document.getElementById("resultat").textContent =
    "Partie terminée ! Ton score est de " + score + " sur " + images.length + " !";
    }
}
boutonValider.addEventListener("click", function() {
    if (partieTerminee) {
    return;
}
    if (reponseValidee) {
    return;
}
    const couleursChoisies = document.querySelectorAll(
        '#couleurs input:checked'
    );

    console.log(couleursChoisies);
    const bonnesCouleurs = images[imageActuelle].couleurs;

const reponsesCorrectes = Array.from(couleursChoisies).map(
    choix => choix.value
);

if (
    bonnesCouleurs.length === reponsesCorrectes.length &&
    bonnesCouleurs.every(couleur => reponsesCorrectes.includes(couleur))
) {
    affichageResultat.textContent = "Bonne réponse !";

    score = score + 1;
    affichageScore.textContent = "Score : " + score;

    reponseValidee = true;

} else {
    affichageResultat.textContent = "Mauvaise réponse !";

    reponseValidee = true;
}
imageSuivante();
});
boutonRecommencer.addEventListener("click", function() {
    recommencerPartie();
});