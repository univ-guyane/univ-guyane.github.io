// Récupération du Canvas
const canvas = document.getElementById("jardin");
//Préparation du contexte de dessin
const ctx = canvas.getContext("2d");

// Adapter le Canvas aux dimensions de l'écran

function redimensionnerCanvas(){

    const ratio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// Définir les dimensions au chargement
redimensionnerCanvas();

// Adapter le jardin si la fenêtre change de taille
window.addEventListener("resize", redimensionnerCanvas);

// Palette de couleur du jardin

const couleurs = [
    "#D500F9",
    "#FF1744",
    "#00E5FF",
    "#FF6D00",
    "#00D6C9",
    "#76FF03",
    "#FFEA00",
];

// Création d'une nouvelle fleur

const fleurs = [];

// Particules lumineuses du jardin
const particules = [];
// Effets magiques déclenchés par les clics
const effetsClic = [];

function creerParticule(){

    return {
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,

        taille: 0.8 + Math.random() * 1.8,

        vitesseX: (Math.random() - 0.5) * 12,
        vitesseY: (Math.random() - 0.5) * 12,

        phase: Math.random() * Math.PI * 2,
        vitesseLumiere: 0.8 + Math.random() * 1.5,

        couleur: couleursParticules[
            Math.floor(Math.random() * couleursParticules.length)
        ]
    };
}

const couleursParticules = [
    "#bd4dff",
    "#ff4fd8",
    "#36d9ff",
    "#ffffff"
];

// Créer les premières particules
for (let i = 0; i < 45; i++){
    particules.push(creerParticule());
}

// Dessiner les particules lumineuses

function dessinerParticules(){

    const temps = performance.now() / 1000;

    for (const particule of particules){

        // Faire scintiller la particule
        const luminosite = (
            Math.sin(temps * particule.vitesseLumiere
            + particule.phase) + 1
        ) / 2;

        ctx.save();

        ctx.globalAlpha = 0.2 + luminosite * 0.7;

        // Dessiner la lumière
        ctx.beginPath();

        ctx.arc(
            particule.x,
            particule.y,
            particule.taille,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = particule.couleur;
        ctx.shadowColor = particule.couleur;
        ctx.shadowBlur = 10;

        ctx.fill();

        ctx.restore();
    }
}

// Dessiner les effets magiques au clic

function dessinerEffetsClic(){

    const maintenant = performance.now();

    for (let i = effetsClic.length - 1; i >= 0; i--){

        const effet = effetsClic[i];

        const temps = maintenant - effet.debut;
        const progression = Math.min(temps / 650, 1);

        // Faire disparaître progressivement l'effet
        const opacite = 1 - progression;

        // Agrandir progressivement le cercle lumineux
        const rayon = progression * 30;

        ctx.save();

        ctx.globalAlpha = opacite;

        // Dessiner l'onde lumineuse
        ctx.beginPath();
        ctx.arc(effet.x, effet.y, rayon, 0, Math.PI * 2);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = effet.couleur;
        ctx.shadowBlur = 18;

        ctx.stroke();

        // Faire s'éloigner les petites étincelles
        for (const etincelle of effet.etincelles){

            const distance = progression * 35;

            const x = effet.x
                + Math.cos(etincelle.angle) * distance;

            const y = effet.y
                + Math.sin(etincelle.angle) * distance;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                etincelle.taille * (1 - progression),
                0,
                Math.PI * 2
            );

            ctx.fillStyle = effet.couleur;
            ctx.shadowColor = effet.couleur;
            ctx.shadowBlur = 12;

            ctx.fill();
        }

        ctx.restore();

        // Supprimer l'effet lorsqu'il est terminé
        if (progression >= 1){
            effetsClic.splice(i, 1);
        }
    }
}

// Animer les particules lumineuses

function animerParticules(){

    for (const particule of particules){

        particule.x += particule.vitesseX / 60;
        particule.y += particule.vitesseY / 60;

        // Réapparaître de l'autre côté du jardin
        if (particule.x < 0){
            particule.x = canvas.clientWidth;
        }

        if (particule.x > canvas.clientWidth){
            particule.x = 0;
        }

        if (particule.y < 0){
            particule.y = canvas.clientHeight;
        }

        if (particule.y > canvas.clientHeight){
            particule.y = 0;
        }
    }
}

function creerFleur(x, y){
    const couleur = couleurs[
        Math.floor(Math.random() * couleurs.length)
    ];
    const taille = 8 + Math.random() * 10;
    const nombrePetales = 6 +
    Math.floor(Math.random() * 3);
    
    const fleur = {
        x: x,
        y: y,
        couleur: couleur,
        taille: taille,
        nombrePetales: nombrePetales,

        // Inclinaison naturelle de la fleur
        inclinaison: (Math.random() - 0.5 ) * 28,
        // Orientation de la tête de la fleur
        orientation: (Math.random() - 0.5) * 0.5,
        decalageLumiere: Math.random() * 1800,
        // Paramètre du balancement naturel
        phaseBalancement: Math.random() * Math.PI * 2,
        amplitudeBalancement: 0.025 + Math.random() * 0.025,
        vitesseBalancement: 0.8 + Math.random() * 0.7,

        // Informations sur la croissance 
        progression: 0,
        hauteurTige: 40 + Math.random() * 60,
        debut: performance.now(),

        // Informations sur la floraison
        modeEclosion: Math.random() < 0.5 ? "spirale" : "simultanee", 
        debutEclosion: null,
        debutFloraison: null,
        debutChute: null,
        petalesDetaches: [],
        prochainPetale: 0,
        debutChuteTige: null,
    };

    fleurs.push(fleur);
}

// Assombrir progressivement la couleur d'une fleur
function melangerCouleurs(couleur1, couleur2, progression){

    const debut = couleur1.match(/\w\w/g).map(
        valeur => parseInt(valeur, 16)
    );

    const fin = couleur2.match(/\w\w/g).map(
        valeur => parseInt(valeur, 16)
    );

    const resultat = debut.map((valeur, index) => {
        return Math.round(
            valeur + (fin[index] - valeur) * progression
        );
    });

    return "#" + resultat.map(valeur => {
        return valeur.toString(16).padStart(2, "0");
    }).join("");
}

// Dessiner la tige de la fleur

function dessinerTige(fleur, progression, chute = 0){

    // Calculer la hauteur actuelle
    const hauteur = fleur.hauteurTige * progression;

    // Définir le point de départ
    const departX = fleur.x;
    const departY = fleur.y;

    // Calculer la position du sommet
    const sommetX = fleur.x
        + Math.sin(progression * 1.2) * 8
        +fleur.inclinaison * progression
        + chute * 70;

    const sommetY = fleur.y
        - hauteur
        + chute * hauteur * 0.85;

    // Calculer la courbure
    const controleX = fleur.x - 8 + chute * 40;

    const controleY = departY
        - hauteur * 0.5
        + chute * hauteur * 0.4;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(departX, departY);

    ctx.quadraticCurveTo(
        controleX,
        controleY,
        sommetX,
        sommetY
    );
    
    // Apparence lumineuse de la tige

    const intensite = 1 - chute;

    // Dégradé naturel entre le vert et le cyan
    const gradient = ctx.createLinearGradient(
        departX,
        departY,
        sommetX,
        sommetY
    );

    gradient.addColorStop(0, "#087f65");
    gradient.addColorStop(0.45, "#00ff99");
    gradient.addColorStop(1, "#8affdc");

    // Première couche : halo extérieur
    ctx.globalAlpha = intensite * 0.3;
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Deuxième couche : corps lumineux de la tige
    ctx.globalAlpha = intensite;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 7;
    ctx.stroke();

    // Calculer la position de la lumière qui circule
    const tempsLumiere = ((performance.now() 
    + fleur.decalageLumiere) % 1800) / 1800;

    const inverse = 1 - tempsLumiere;

    const lumiereX =
        inverse * inverse * departX
        + 2 * inverse * tempsLumiere * controleX
        + tempsLumiere * tempsLumiere * sommetX;

    const lumiereY =
        inverse * inverse * departY
        + 2 * inverse * tempsLumiere * controleY
        + tempsLumiere * tempsLumiere * sommetY;

    // Petit point lumineux mobile
    ctx.globalAlpha = intensite * 0.95;
    ctx.beginPath();
    ctx.arc(lumiereX, lumiereY, 2, 0, Math.PI * 2);

    ctx.fillStyle = "#d5fff0";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 16;
    ctx.fill();

    ctx.restore();
}

// Dessiner les feuilles de la fleur

function dessinerFeuilles(fleur, progression, chute = 0){

    // Définir les points de la tige
    const departX = fleur.x;
    const departY = fleur.y;
    
    const hauteur = fleur.hauteurTige * progression;

    const sommetX = fleur.x
        + Math.sin(progression * 1.2) * 8
        + fleur.inclinaison * progression
        + chute * 70;

    const sommetY = fleur.y
        - hauteur
        + chute * hauteur * 0.85;
     
        const controleX = fleur.x - 8 + chute * 40;

    const controleY = departY
        - hauteur * 0.5
        + chute * hauteur * 0.4;

    // Définir les positions des feuilles
    const positions = [0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.88];

    for (let i = 0; i < positions.length; i++){

        const t = positions[i];

        // Faire apparaître les feuilles progressivement
        if (progression < t) continue;

        const apparition = Math.min((progression - t) / 0.12, 1);

        // Calculer la position sur la tige
        const inverse = 1 - t;

        const x = inverse * inverse * departX
            + 2 * inverse * t * controleX
            + t * t * sommetX;

        const y = inverse * inverse * departY
            + 2 * inverse * t * controleY
            + t * t * sommetY;

        // Calculer l'orientation de la tige
        const dx = 2 * inverse * (controleX - departX)
            + 2 * t * (sommetX - controleX);

        const dy = 2 * inverse * (controleY - departY)
            + 2 * t * (sommetY - controleY);

        const angleTige = Math.atan2(dy, dx);

        // Alterner les feuilles de chaque côté
        const cote = i % 2 === 0 ? -1 : 1;

        ctx.save();

        ctx.globalAlpha = apparition * (1 - chute);

        ctx.translate(x, y);

        ctx.rotate(angleTige + cote * 1.05);

        ctx.scale(apparition, apparition);

        // Taille légèrement variable
        const longueur = 11 + Math.sin(i * 2.5) * 2;
        const largeur = 3.8 + Math.cos(i * 1.8) * 0.6;

        // Dessiner la forme de la feuille
        ctx.beginPath();

        ctx.moveTo(0, 0);

        ctx.bezierCurveTo(
            longueur * 0.3, -largeur * 1.5,
            longueur * 0.75, -largeur,
            longueur, 0
        );

        ctx.bezierCurveTo(
            longueur * 0.75, largeur,
            longueur * 0.3, largeur * 1.5,
            0, 0
        );

        ctx.closePath();

        // Dégradé vert lumineux
        const gradient = ctx.createLinearGradient(
            0, -largeur, longueur, largeur
        );

        gradient.addColorStop(0, "#00ff99");
        gradient.addColorStop(0.5, "#087f65");
        gradient.addColorStop(1, "#003d3b");

        ctx.fillStyle = gradient;

        ctx.shadowColor = "#00ff99";
        ctx.shadowBlur = 6;

        ctx.fill();

        // Dessiner la nervure centrale
        ctx.beginPath();

        ctx.moveTo(1, 0);
        ctx.quadraticCurveTo(
            longueur * 0.5, 0,
            longueur * 0.92, 0
        );

        ctx.strokeStyle = "rgba(180,255,220,0.8)";
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 5;

        ctx.stroke();

        ctx.restore();
    }
}

// Dessiner le bourgeon au sommet de la tige

function dessinerBourgeon(fleur, progression){

    // Le bourgeon apparaît à la fin de la croissance
    if (progression < 0.8) return;

    const apparition = Math.min((progression - 0.8) / 0.2, 1);
    // Calculer la position du sommet de la tige 
    const hauteur = fleur.hauteurTige * progression;
    const sommetX = fleur.x 
    + Math.sin(progression * 1.2) * 8
    + fleur.inclinaison * progression;

    const sommetY = fleur.y - hauteur;
    ctx.save();
    ctx.translate(sommetX, sommetY);
    ctx.scale(apparition, apparition);
    
    //Dessiner l'enveloppe du bourgeon
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff99";
    ctx.shadowColor = "#00ff99";
    ctx.shadowBlur = 12;
    ctx.fill();
   
    // Petite touche de couleur au sommet
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0, Math.PI * 2);
    ctx.fillStyle = fleur.couleur;
    ctx.shadowColor = fleur.couleur;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();

}

// Dessiner un pétale

// Dessiner un pétale avec un effet de volume 3D

// Dessiner un pétale lumineux et arrondi

function dessinerPetale(x, y, taille, couleur, angle, ouverture, opacite){

    ctx.save();

    ctx.globalAlpha = opacite;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(ouverture, ouverture);

    // Créer une forme plus large et arrondie
    ctx.beginPath();
    ctx.moveTo(0, 0);

    ctx.bezierCurveTo(
        -taille * 0.95, -taille * 0.45,
        -taille * 0.9, -taille * 1.65,
        0, -taille * 2
    );

    ctx.bezierCurveTo(
        taille * 0.9, -taille * 1.65,
        taille * 0.95, -taille * 0.45,
        0, 0
    );

    ctx.closePath();

   // Dégradé donnant du relief
const gradient = ctx.createLinearGradient(
    0, 0,
    0, -taille * 2
);

// Adapter les nuances à la couleur actuelle du pétale
const couleurClaire = melangerCouleurs(
    couleur,
    "#ffffff",
    0.18
);

const couleurSombre = melangerCouleurs(
    couleur,
    "#000000",
    0.25
);

gradient.addColorStop(0, couleurClaire);
gradient.addColorStop(0.3, couleur);
gradient.addColorStop(0.75, couleur);
gradient.addColorStop(1, couleurSombre);

    ctx.fillStyle = gradient;

    // Halo lumineux
    ctx.shadowColor = couleur;
    ctx.shadowBlur = 7;
    ctx.fill();

    // Reflet central
    ctx.beginPath();
    ctx.moveTo(0, -taille * 0.25);

    ctx.quadraticCurveTo(
        -taille * 0.25,
        -taille * 1.1,
        0,
        -taille * 1.75
    );

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.1;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 3;
    ctx.stroke();

    ctx.restore();
}
// Dessiner un pétale qui tombe

function dessinerPetaleTombe(petale, fleur){

    const maintenant = performance.now();

    // Temps écoulé depuis le détachement
    const temps = (maintenant - petale.debut) / 1000;

    // Calculer la position du pétale
    const x = petale.x
        + petale.vitesseX * temps
        + Math.sin(temps * 3 + petale.phase) * 8;

    const y = petale.y
        + petale.vitesseY * temps
        + 0.5 * petale.gravite * temps * temps;

    // Faire tourner et disparaître progressivement le pétale
    const rotation = petale.rotation
        + petale.vitesseRotation * temps;

    const opacite = Math.max(1 - temps / 3, 0);

    // Dessiner le pétale avec sa couleur assombrie
    dessinerPetale(
        x,
        y,
        fleur.taille,
        petale.couleur,
        rotation,
        0.8,
        opacite
    );
}

// Dessiner une fleur complète

function dessinerFleur(fleur, tempsEcoule){

    // Calculer le sommet de la tige
    const hauteur = fleur.hauteurTige;

    const sommetX = fleur.x
        + Math.sin(1.2) * 8
        + fleur.inclinaison;

    const sommetY = fleur.y - hauteur;

    // Calculer le temps de floraison
    const tempsFloraison = fleur.debutFloraison === null
        ? 0
        : performance.now() - fleur.debutFloraison;

    // Faire flétrir progressivement les pétales
const progressionFletrissement = Math.min(
    Math.max((tempsFloraison - 7000) / 2500, 0),
    1
);

// Mélanger la couleur originale avec un violet sombre
const couleurFleur = melangerCouleurs(
    fleur.couleur,
    "#55306a",
    progressionFletrissement
);

// Conserver les pétales visibles pendant le flétrissement
const opacite = 1;

    // Parcourir les pétales
    for (let i = 0; i < fleur.nombrePetales; i++){

        // Ignorer les pétales déjà détachés
        if (fleur.petalesDetaches.some(
            petale => petale.index === i
        )){
            continue;
        }

        const angle =
            (Math.PI * 2 / fleur.nombrePetales) * i
            + fleur.orientation;

        // Calculer l'ouverture progressive
        let ouverture;

        if (fleur.modeEclosion === "spirale"){
            ouverture = Math.min(
                Math.max((tempsEcoule - i * 500) / 700, 0),
                1
            );
        } else {
            ouverture = Math.min(tempsEcoule / 1600, 1);
        }

        

            // Dessiner les deux couches de pétales
        if (ouverture > 0){

            // Couche extérieure
            dessinerPetale(
                sommetX,
                sommetY,
                fleur.taille,
                couleurFleur,
                angle,
                ouverture,
                opacite
            );

            // Couche intérieure, plus petite et décalée
            dessinerPetale(
                sommetX,
                sommetY,
                fleur.taille * 0.62,
                couleurFleur,
                angle + Math.PI / fleur.nombrePetales,
                ouverture * 0.85,
                opacite * 0.9
            );
        }
        
    }

    // Cœur lumineux de la fleur
ctx.save();

// Faire disparaître le cœur avec les pétales
const disparitionCoeur = Math.max(
    1 - (fleur.petalesDetaches.length / fleur.nombrePetales),
    0
);

ctx.globalAlpha = opacite * disparitionCoeur;

    const coeur = ctx.createRadialGradient(
        sommetX,
        sommetY,
        1,
        sommetX,
        sommetY,
        fleur.taille * 0.65
    );

    coeur.addColorStop(0, "#ffffff");
    coeur.addColorStop(0.35, "#fff4a8");
    coeur.addColorStop(1, couleurFleur);

    ctx.beginPath();

    ctx.arc(
        sommetX,
        sommetY,
        fleur.taille * 0.42,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = coeur;
    ctx.shadowColor = couleurFleur;
    ctx.shadowBlur = 18;
    ctx.fill();

    ctx.restore();
}
 
// Dessiner toutes les fleurs du jardin

function dessinerJardin(){

    // Parcourir toutes les fleurs du jardin
    for (const fleur of fleurs){

        // Vérifier si la tige a terminé sa chute
        const tempsChuteTige = fleur.debutChuteTige === null
            ? 0
            : performance.now() - fleur.debutChuteTige;

        const tigeTerminee = tempsChuteTige >= 2200
            && fleur.debutChuteTige !== null;

        // Dessiner la plante tant que sa tige est visible
if (!tigeTerminee){

    // Calculer le balancement de la fleur
    const temps = performance.now() / 1000;

    const balancement = Math.sin(
        temps * fleur.vitesseBalancement
        + fleur.phaseBalancement
    ) * fleur.amplitudeBalancement;

    // Appliquer le mouvement autour de la base de la tige
    ctx.save();

    ctx.translate(fleur.x, fleur.y);
    ctx.rotate(balancement);
    ctx.translate(-fleur.x, -fleur.y);

    const chuteTige = fleur.debutChuteTige === null
        ? 0
        : Math.min(tempsChuteTige / 2200, 1);

    // Dessiner la tige
    dessinerTige(
        fleur,
        fleur.progression,
        chuteTige
    );

    // Dessiner les feuilles
    dessinerFeuilles(
        fleur,
        fleur.progression,
        chuteTige
    );

    // Afficher le bourgeon pendant la croissance
    if (fleur.progression < 1){

        dessinerBourgeon(
            fleur,
            fleur.progression
        );

    } else if (fleur.debutEclosion !== null){

        const tempsEclosion =
            performance.now() - fleur.debutEclosion;

        dessinerFleur(fleur, tempsEclosion);
    }

    ctx.restore();
}

        // Les pétales détachés continuent de tomber
        for (const petale of fleur.petalesDetaches){

            const temps =
                (performance.now() - petale.debut) / 1000;

            if (temps < 3){
                dessinerPetaleTombe(petale, fleur);
            }
        }
    }
}

    //Détecter les clics sur le jardin

canvas.addEventListener("click", function(event){

    const rectangle = canvas.getBoundingClientRect();

    const x = event.clientX - rectangle.left;
    const y = event.clientY - rectangle.top;

    // Choisir une couleur pour l'effet magique
    const couleur = couleurs[
        Math.floor(Math.random() * couleurs.length)
    ];

    // Créer les petites étincelles
    const etincelles = [];

    for (let i = 0; i < 8; i++){

        etincelles.push({
            angle: (Math.PI * 2 / 8) * i,
            taille: 1.5 + Math.random() * 2
        });
    }

    // Enregistrer le nouvel effet
    effetsClic.push({
        x: x,
        y: y,
        couleur: couleur,
        debut: performance.now(),
        etincelles: etincelles
    });

    // Faire pousser la fleur
    creerFleur(x, y);
});

// Animation principale du jardin

function animerJardin(){

    // Effacer l'image précédente
    ctx.clearRect(
        0, 0,
        canvas.clientWidth,
        canvas.clientHeight
    );

    // Faire évoluer la croissance des fleurs
    for (const fleur of fleurs){
        if (fleur.progression < 1){
            const tempsEcoule = performance.now() - fleur.debut;
            fleur.progression = Math.min( tempsEcoule / 3000, 1);
        }

        //Déclencher l'éclosion à la fin de la croissance
        if (fleur.progression >= 1 && fleur.debutEclosion === null){
            fleur.debutEclosion = performance.now();
        }

        // Vérifier si tous les pétales sont ouverts
        if (fleur.debutEclosion !== null && fleur.debutFloraison === null){
            const tempsEclosion = performance.now() - fleur.debutEclosion;
            const dureeOuverture = fleur.modeEclosion === "spirale" ?
            (fleur.nombrePetales - 1) * 500 + 700 : 1600;
            if (tempsEclosion >= dureeOuverture){
                fleur.debutFloraison = performance.now();
            }
        }

        // Déclencher la chute après 7 secondes de floraison

if (fleur.debutFloraison !== null){

    const maintenant = performance.now();

    const tempsFloraison = maintenant - fleur.debutFloraison;

    if (tempsFloraison >= 9500){

        // Mémoriser le début de la chute
        if (fleur.debutChute === null){
            fleur.debutChute = maintenant;
        }

        const tempsChute = maintenant - fleur.debutChute;

        // Détacher les pétales progressivement
        while (
            fleur.prochainPetale < fleur.nombrePetales &&
            tempsChute >= fleur.prochainPetale * 180
        ){

            const index = fleur.prochainPetale;

            const angle = (Math.PI * 2 / fleur.nombrePetales) * index
            + fleur.orientation;

            const sommetX = fleur.x + Math.sin(1.2) * 8
            + fleur.inclinaison;
            const sommetY = fleur.y - fleur.hauteurTige;

            // Calculer la progression du flétrissement
const progressionFletrissement = Math.min(
    Math.max((tempsFloraison - 7000) / 2500, 0),
    1
);

// Calculer la couleur assombrie du pétale
const couleurPetale = melangerCouleurs(
    fleur.couleur,
    "#55306a",
    progressionFletrissement
);

// Créer le pétale détaché
fleur.petalesDetaches.push({

    index: index,
    x: sommetX,
    y: sommetY,
    debut: maintenant,
    rotation: angle,
    vitesseRotation: (Math.random() - 0.5) * 3,
    vitesseX: (Math.random() - 0.5) * 50,
    vitesseY: -15 + Math.random() * 25,
    gravite: 70,
    phase: Math.random() * Math.PI * 2,
    couleur: couleurPetale,
    opacite: 1
});

            fleur.prochainPetale++;
        }

        // Déclencher la chute de la tige 
        //aprés le détachement de tous les pétals

        if(
            fleur.prochainPetale >= fleur.nombrePetales &&
            fleur.debutChuteTige === null && 
            fleur.debutChute !== null
        ){

            const dureeDetachement = (fleur.nombrePetales - 1) * 180;
            const tempsChute = performance.now() - fleur.debutChute;
            if (tempsChute >= dureeDetachement + 700){

                fleur.debutChuteTige = performance.now();
            }
        }
    }
}
    }

    // Animer et dessiner les particules
    animerParticules();
    dessinerParticules();

    // Dessiner les effets magique au clic
    dessinerEffetsClic();

    //Redessiner toutes les fleurs
    dessinerJardin();

    // Nettoyer les fleurs ayant terminé leur cycle de vie

    for (let i = fleurs.length - 1; i >= 0; i--){

        const fleur = fleurs[i];

        if (
            fleur.debutChute !== null &&
            fleur.prochainPetale >= fleur.nombrePetales
        ){

            const dureeVie =
                (fleur.nombrePetales - 1) * 180 + 3000;

            const tempsDepuisChute =
                performance.now() - fleur.debutChute;

            if (tempsDepuisChute >= dureeVie){
                fleurs.splice(i, 1);
            }
        }
    }

    //Préparer la prochaine image 
    requestAnimationFrame(animerJardin);
    
}

//Lancer l'animation
animerJardin();

