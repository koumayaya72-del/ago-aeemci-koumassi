/**
 * ==========================================================================
 * BASE DE DONNÉES & SYSTÈME D'ÉMARGEMENT QR CODE — A.G.O. AEEMCI KOUMASSI
 * Gestion du registre des inscriptions, génération des matricules officiels,
 * validation des présences par scan QR Code, statistiques du Quorum et export CSV.
 * ==========================================================================
 */

const STORAGE_KEY_AGO = 'aeemci_koumassi_ago_registre_2026';

// Données initiales d'exemple si le registre est vide (pour tester immédiatement le scanner)
const SEED_DELEGUES = [
  {
    matricule: 'AGO-KMSSI-26-A101',
    nom: 'KONE Ibrahim',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Lycée Municipal de Koumassi (LMK)',
    telephone: '+225 07 12 34 56 78',
    presence: 'Présence Confirmée',
    message: 'Que les travaux soient couronnés de succès.',
    date_inscription: '2026-11-10 14:20',
    emarge: true,
    date_emargement: '28/11/2026 07:42:15'
  },
  {
    matricule: 'AGO-KMSSI-26-B202',
    nom: 'TRAORE Aminata',
    role: 'Délégué Officiel de Section (Votant)',
    section: 'Section EMSP Abidjan',
    telephone: '+225 05 98 76 54 32',
    presence: 'Présence Confirmée',
    message: 'Présente pour représenter la section universitaire.',
    date_inscription: '2026-11-11 09:15',
    emarge: true,
    date_emargement: '28/11/2026 07:48:30'
  },
  {
    matricule: 'AGO-KMSSI-26-C303',
    nom: 'OUATTARA Souleymane',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Collège Sainte-Thérèse',
    telephone: '+225 01 44 55 66 77',
    presence: 'Présence Confirmée',
    message: 'Tous mobilisés pour le sous-comité.',
    date_inscription: '2026-11-12 11:40',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-D404',
    nom: 'DIABATE Fatoumata',
    role: 'Déléguée Officielle de Section (Votant)',
    section: 'Section Collège Moderne de Koumassi',
    telephone: '+225 07 88 99 00 11',
    presence: 'Présence Confirmée',
    message: 'Pour le rayonnement de notre sous-comité.',
    date_inscription: '2026-11-12 16:05',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-E505',
    nom: 'COULIBALY Lassina',
    role: 'Membre du Bureau Exécutif (Trésorier Général)',
    section: 'Sous-Comité AEEMCI de Koumassi',
    telephone: '+225 05 11 22 33 44',
    presence: 'Présence Confirmée',
    message: 'Rapport financier prêt pour présentation.',
    date_inscription: '2026-11-13 10:30',
    emarge: true,
    date_emargement: '28/11/2026 07:35:10'
  },
  {
    matricule: 'AGO-KMSSI-26-F606',
    nom: 'SANOGO Youssouf',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Lycée Moderne Badou',
    telephone: '+225 01 23 45 67 89',
    presence: 'Présence Confirmée',
    message: 'Présence assurée avec notre délégation.',
    date_inscription: '2026-11-13 14:15',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-G707',
    nom: 'DEMBELE Brahima',
    role: 'Ancien Président (Les 3AK)',
    section: 'Amicale des Anciens de Koumassi (3AK)',
    telephone: '+225 07 77 66 55 44',
    presence: 'Présence Confirmée',
    message: 'Tous nos vœux de réussite au Président Sow Mohamed.',
    date_inscription: '2026-11-14 08:50',
    emarge: false,
    date_emargement: null
  }
];

/**
 * Initialise le registre local
 */
function getRegistreAGO() {
  const data = localStorage.getItem(STORAGE_KEY_AGO);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_AGO, JSON.stringify(SEED_DELEGUES));
    return SEED_DELEGUES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Enregistre le registre local
 */
function saveRegistreAGO(registre) {
  localStorage.setItem(STORAGE_KEY_AGO, JSON.stringify(registre));
}

/**
 * Génère un matricule officiel unique
 * Format : AGO-KMSSI-26-XXXX
 */
function genererMatriculeAGO() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGO-KMSSI-26-${code}`;
}

/**
 * Ajoute une nouvelle inscription dans la base de données
 */
function ajouterInscriptionAGO(data) {
  const registre = getRegistreAGO();
  const matricule = genererMatriculeAGO();

  const maintenant = new Date();
  const dateStr = maintenant.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const nouvelleInscription = {
    matricule: matricule,
    nom: data.nom.trim(),
    role: data.role || 'Délégué Officiel de Section (Votant)',
    section: data.section ? data.section.trim() : 'Sous-Comité Koumassi',
    telephone: data.telephone ? data.telephone.trim() : '',
    presence: data.presence || 'Présence Confirmée avec Certitude',
    message: data.message ? data.message.trim() : '',
    date_inscription: dateStr,
    emarge: false,
    date_emargement: null
  };

  registre.unshift(nouvelleInscription);
  saveRegistreAGO(registre);

  return nouvelleInscription;
}

/**
 * Recherche une inscription par son matricule
 */
function trouverParMatricule(matricule) {
  if (!matricule) return null;
  const registre = getRegistreAGO();
  const cleanMat = String(matricule).trim().toUpperCase();
  return registre.find(item => item.matricule.toUpperCase() === cleanMat) || null;
}

/**
 * Valide l'émargement d'un participant via son matricule (Scan QR Code)
 * Retourne : { success: boolean, dejaEmarge: boolean, delegue: object }
 */
function validerEmargementParMatricule(matricule) {
  const registre = getRegistreAGO();
  const cleanMat = String(matricule).trim().toUpperCase();
  const index = registre.findIndex(item => item.matricule.toUpperCase() === cleanMat);

  if (index === -1) {
    return { success: false, introuvable: true, message: 'Matricule non reconnu dans le registre officiel de l’A.G.O.' };
  }

  const delegue = registre[index];

  if (delegue.emarge) {
    return {
      success: false,
      dejaEmarge: true,
      delegue: delegue,
      message: `Ce délégué a DÉJÀ été émargé le ${delegue.date_emargement}.`
    };
  }

  const maintenant = new Date();
  const heureStr = maintenant.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  delegue.emarge = true;
  delegue.date_emargement = heureStr;
  registre[index] = delegue;
  saveRegistreAGO(registre);

  return {
    success: true,
    delegue: delegue,
    message: `Présence validée avec succès pour ${delegue.nom} (${delegue.section}) !`
  };
}

/**
 * Calcule les statistiques en direct pour le Quorum
 */
function calculerStatistiquesAGO() {
  const registre = getRegistreAGO();
  const total = registre.length;
  const emarges = registre.filter(d => d.emarge).length;
  const enAttente = total - emarges;

  // Calcul du nombre de sections distinctes représentées
  const sectionsDistinctes = new Set();
  registre.filter(d => d.emarge).forEach(d => {
    if (d.section) sectionsDistinctes.add(d.section.toLowerCase());
  });

  const sectionsCount = sectionsDistinctes.size;
  const quorumObjectif = 14; // 2/3 des 21 sections statutaires de Koumassi

  return {
    total,
    emarges,
    enAttente,
    sectionsRepresentees: sectionsCount,
    quorumObjectif,
    quorumAtteint: sectionsCount >= quorumObjectif
  };
}

/**
 * Exporte l'intégralité du registre en fichier CSV pour Excel
 */
function exporterRegistreEnCSV() {
  const registre = getRegistreAGO();
  if (!registre.length) {
    alert("Le registre d'émargement est vide pour le moment.");
    return;
  }

  const entetes = ['Matricule', 'Nom et Prénoms', 'Qualité / Titre', 'Section / Structure', 'Téléphone', 'Statut Présence', 'Émargé (Présent)', 'Date / Heure Émargement', 'Message'];
  const lignes = registre.map(d => [
    `"${d.matricule}"`,
    `"${d.nom.replace(/"/g, '""')}"`,
    `"${(d.role || '').replace(/"/g, '""')}"`,
    `"${(d.section || '').replace(/"/g, '""')}"`,
    `"${d.telephone || ''}"`,
    `"${d.presence || ''}"`,
    `"${d.emarge ? 'OUI (PRÉSENT)' : 'NON (EN ATTENTE)'}"`,
    `"${d.date_emargement || '-'}"`,
    `"${(d.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [entetes.join(';'), ...lignes.map(l => l.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Registre_Emargement_AGO_AEEMCI_Koumassi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
